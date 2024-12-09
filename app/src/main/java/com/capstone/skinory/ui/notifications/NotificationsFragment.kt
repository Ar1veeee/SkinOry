package com.capstone.skinory.ui.notifications

import android.Manifest
import android.app.AlarmManager
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.capstone.skinory.data.Injection
import com.capstone.skinory.data.UserPreferences
import com.capstone.skinory.data.remote.response.GroupedRoutinesItem
import com.capstone.skinory.databinding.FragmentNotificationsBinding
import com.capstone.skinory.ui.ViewModelFactory
import com.capstone.skinory.ui.login.LoginViewModel
import com.capstone.skinory.ui.notifications.chose.ChoseActivity
import com.capstone.skinory.ui.notifications.notify.NotificationHelper
import java.util.Locale

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!
    private lateinit var notificationAdapter: NotificationAdapter
    private lateinit var routineViewModel: RoutineViewModel
    private lateinit var notificationHelper: NotificationHelper
    private lateinit var userPreferences: UserPreferences

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)

        userPreferences = UserPreferences(requireContext())
        notificationHelper = NotificationHelper(requireContext())

        val viewModelFactory = Injection.provideViewModelFactory(requireContext())
        routineViewModel = ViewModelProvider(this, viewModelFactory)[RoutineViewModel::class.java]

        if (userPreferences.areNotificationsEnabled()) {
            // Pastikan semua izin terpenuhi
            if (hasExactAlarmPermission() &&
                (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
                        ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED)
            ) {
                notificationHelper.scheduleNotifications()
            } else {
                // Nonaktifkan notifikasi jika izin tidak terpenuhi
                userPreferences.setNotificationsEnabled(false)
                binding.switchNotification.isChecked = false
            }
        }

        checkAndRequestAlarmPermission()
        hasExactAlarmPermission()
        setupNotificationSwitch()
        setupRecyclerView()
        observeRoutines()
        setupFloatingActionButton()

        // Fetch routines when fragment is created
        routineViewModel.fetchRoutines()

        return binding.root
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            NOTIFICATION_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // Izin diberikan
                    Log.d("NotificationsFragment", "Notification permission granted")

                    // Pastikan alarm permission juga diizinkan
                    if (hasExactAlarmPermission()) {
                        binding.switchNotification.isChecked = true
                        notificationHelper.scheduleNotifications()
                        userPreferences.setNotificationsEnabled(true)
                    } else {
                        checkAndRequestAlarmPermission()
                    }
                } else {
                    // Izin ditolak
                    Log.d("NotificationsFragment", "Notification permission denied")
                    binding.switchNotification.isChecked = false

                    // Tampilkan dialog penjelasan
                    showPermissionRationaleDialog()
                }
            }
        }
    }

    private fun showPermissionRationaleDialog() {
        AlertDialog.Builder(requireContext())
            .setTitle("Izin Diperlukan")
            .setMessage("Notifikasi dibutuhkan untuk mengingatkan jadwal skincare Anda. Mohon berikan izin.")
            .setPositiveButton("Buka Pengaturan") { _, _ ->
                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                val uri = Uri.fromParts("package", requireContext().packageName, null)
                intent.data = uri
                startActivity(intent)
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun checkAndRequestAlarmPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = requireContext().getSystemService(Context.ALARM_SERVICE) as AlarmManager
            if (!alarmManager.canScheduleExactAlarms()) {
                try {
                    // Tampilkan dialog untuk meminta izin
                    AlertDialog.Builder(requireContext())
                        .setTitle("Izin Alarm Diperlukan")
                        .setMessage("Aplikasi membutuhkan izin untuk menjadwalkan alarm tepat. Buka pengaturan?")
                        .setPositiveButton("Buka Pengaturan") { _, _ ->
                            // Buka pengaturan sistem untuk mengizinkan exact alarm
                            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                            startActivity(intent)
                        }
                        .setNegativeButton("Batal", null)
                        .show()
                } catch (e: ActivityNotFoundException) {
                    // Fallback jika intent tidak tersedia
                    try {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                        intent.data = Uri.parse("package:${requireContext().packageName}")
                        startActivity(intent)
                    } catch (ex: Exception) {
                        Log.e("NotificationsFragment", "Tidak dapat membuka pengaturan", ex)
                    }
                }
            }
        }
    }

    private fun hasExactAlarmPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = requireContext().getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.canScheduleExactAlarms()
        } else {
            true // Untuk versi Android di bawah 12, izin tidak diperlukan
        }
    }

    private fun setupNotificationSwitch() {
        binding.switchNotification.setOnCheckedChangeListener { _, isChecked ->
            when {
                isChecked -> {
                    if (!userPreferences.isAutoStartPermissionRequested()) {
                        checkAutoStartPermission()
                    }
                    // Periksa izin alarm
                    if (!hasExactAlarmPermission()) {
                        checkAndRequestAlarmPermission()
                        binding.switchNotification.isChecked = false
                        return@setOnCheckedChangeListener
                    }

                    // Untuk Android 13+, minta izin notifikasi
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        if (ContextCompat.checkSelfPermission(
                                requireContext(),
                                Manifest.permission.POST_NOTIFICATIONS
                            ) != PackageManager.PERMISSION_GRANTED
                        ) {
                            requestNotificationPermission()
                            binding.switchNotification.isChecked = false
                            return@setOnCheckedChangeListener
                        }
                    }

                    // Periksa optimasi baterai
                    checkBatteryOptimization()

                    // Jadwalkan notifikasi
                    notificationHelper.scheduleNotifications()
                    userPreferences.setNotificationsEnabled(true)

                    Log.d("NotificationsFragment", "Notifications enabled")
                }
                else -> {
                    // Matikan notifikasi
                    notificationHelper.cancelNotifications()
                    userPreferences.setNotificationsEnabled(false)
                    userPreferences.setAutoStartPermissionRequested(false)
                    Log.d("NotificationsFragment", "Notifications disabled")
                }
            }
        }

        // Set initial switch state from user preferences
        binding.switchNotification.isChecked = userPreferences.areNotificationsEnabled()
    }

    private fun checkBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = requireContext().getSystemService(Context.POWER_SERVICE) as PowerManager
            val packageName = requireContext().packageName

            if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                AlertDialog.Builder(requireContext())
                    .setTitle("Optimasi Baterai")
                    .setMessage("Nonaktifkan optimasi baterai untuk memastikan notifikasi berjalan lancar?")
                    .setPositiveButton("Buka Pengaturan") { _, _ ->
                        try {
                            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                            intent.data = Uri.parse("package:$packageName")
                            startActivity(intent)
                        } catch (e: Exception) {
                            Log.e("NotificationsFragment", "Tidak dapat membuka pengaturan optimasi baterai", e)
                        }
                    }
                    .setNegativeButton("Batal", null)
                    .show()
            }
        }
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    requireContext(),
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissions(
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
            }
        }
    }

    private fun setupRecyclerView() {
        // Inisialisasi notificationAdapter terlebih dahulu
        notificationAdapter = NotificationAdapter(
            viewModel = routineViewModel,
            onDeleteClick = { routine ->
                AlertDialog.Builder(requireContext())
                    .setTitle("Delete Routine")
                    .setMessage("Are you sure you want to delete this routine?")
                    .setPositiveButton("Yes") { _, _ ->
                        routineViewModel.deleteRoutine(routine.applied == "Day")
                    }
                    .setNegativeButton("No", null)
                    .show()
            }
        )

        // Setelah menginisialisasi notificationAdapter, atur adapter untuk RecyclerView
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = notificationAdapter
    }

    private fun observeRoutines() {
        routineViewModel.dayRoutines.observe(viewLifecycleOwner) { dayRoutines ->
            routineViewModel.nightRoutines.observe(viewLifecycleOwner) { nightRoutines ->
                val combinedRoutines = (dayRoutines + nightRoutines)
                    .groupBy { it.applied }
                    .map { (applied, routines) ->
                        GroupedRoutinesItem(
                            applied = applied ?: "Unknown",
                            products = routines.flatMap { it.nameProduct?.split(",")?.map { product -> product.trim() } ?: emptyList() }
                        )
                    }

                notificationAdapter.submitList(combinedRoutines)

                // Enable/disable FloatingActionButton based on active routines
                updateFloatingActionButtonState(combinedRoutines.size)
            }
        }
    }

    private fun updateFloatingActionButtonState(routinesCount: Int) {
        binding.floatingActionButton.isEnabled = routinesCount < 2
        binding.floatingActionButton.alpha = if (routinesCount < 2) 1f else 0.5f
    }

    private fun setupFloatingActionButton() {
        binding.floatingActionButton.setOnClickListener {
            // Only allow adding new routine if less than 2 active routines
            startActivity(Intent(requireContext(), ChoseActivity::class.java))
        }
    }

    private fun checkAutoStartPermission() {
        val manufacturer = Build.MANUFACTURER.lowercase(Locale.getDefault())
        if (isAutoStartPermissionRequired(manufacturer)) {
            if (!isAutoStartPermissionGranted(manufacturer)) {
                showAutoStartPermissionDialog()
            }
        }
    }

    private fun showAutoStartPermissionDialog() {
        AlertDialog.Builder(requireContext())
            .setTitle("Izin Auto-Start")
            .setMessage("Untuk memastikan notifikasi berjalan lancar, mohon izinkan aplikasi untuk berjalan di latar belakang.")
            .setPositiveButton("Buka Pengaturan") { _, _ ->
                try {
                    val manufacturer = Build.MANUFACTURER.lowercase(Locale.getDefault())
                    when (manufacturer) {
                        "xiaomi" -> openXiaomiAutoStartSettings()
                        "oppo" -> openOppoAutoStartSettings()
                        "vivo" -> openVivoAutoStartSettings()
                        "huawei" -> openHuaweiAutoStartSettings()
                        else -> openGenericAutoStartSettings()
                    }

                    // Tandai bahwa izin auto-start telah diminta
                    userPreferences.setAutoStartPermissionRequested(true)
                } catch (e: Exception) {
                    Log.e("NotificationsFragment", "Tidak dapat membuka pengaturan auto-start", e)
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun openXiaomiAutoStartSettings() {
        val intent = Intent().apply {
            component = ComponentName(
                "com.miui.securitycenter",
                "com.miui.permcenter.autostart.AutoStartManagementActivity"
            )
        }
        startActivity(intent)
    }

    private fun openOppoAutoStartSettings() {
        val intent = Intent().apply {
            component = ComponentName(
                "com.color.safecenter",
                "com.color.safecenter.permission.startup.StartupAppListActivity"
            )
        }
        startActivity(intent)
    }

    private fun openVivoAutoStartSettings() {
        val intent = Intent().apply {
            component = ComponentName(
                "com.vivo.permissionmanager",
                "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"
            )
        }
        startActivity(intent)
    }

    private fun openHuaweiAutoStartSettings() {
        val intent = Intent().apply {
            component = ComponentName(
                "com.huawei.systemmanager",
                "com.huawei.systemmanager.startsupport.dialog.ExtraDialogActivity"
            )
            putExtra("package", context?.packageName)
        }
        startActivity(intent)
    }

    private fun openGenericAutoStartSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        val uri = Uri.fromParts("package", requireContext().packageName, null)
        intent.data = uri
        startActivity(intent)
    }

    private fun isAutoStartPermissionRequired(manufacturer: String): Boolean {
        return listOf("xiaomi", "oppo", "vivo", "huawei", "letv", "honor")
            .contains(manufacturer)
    }

    private fun isAutoStartPermissionGranted(manufacturer: String): Boolean {
        return try {
            when (manufacturer) {
                "xiaomi" -> isXiaomiAutoStartPermissionGranted()
                "oppo" -> isOppoAutoStartPermissionGranted()
                "vivo" -> isVivoAutoStartPermissionGranted()
                "huawei" -> isHuaweiAutoStartPermissionGranted()
                else -> true
            }
        } catch (e: Exception) {
            Log.e("NotificationsFragment", "Error checking auto-start permission", e)
            true // Default to true if we can't determine
        }
    }

    private fun isXiaomiAutoStartPermissionGranted(): Boolean {
        return try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                )
            }
            val resolveInfo = context?.packageManager?.resolveActivity(intent, 0)
            resolveInfo == null
        } catch (e: Exception) {
            Log.e("NotificationsFragment", "Error checking Xiaomi auto-start permission", e)
            true
        }
    }

    private fun isOppoAutoStartPermissionGranted(): Boolean {
        return try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.color.safecenter",
                    "com.color.safecenter.permission.startup.StartupAppListActivity"
                )
            }
            val resolveInfo = context?.packageManager?.resolveActivity(intent, 0)
            resolveInfo == null
        } catch (e: Exception) {
            Log.e("NotificationsFragment", "Error checking Oppo auto-start permission", e)
            true
        }
    }

    private fun isVivoAutoStartPermissionGranted(): Boolean {
        return try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.vivo.permissionmanager",
                    "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"
                )
            }
            val resolveInfo = context?.packageManager?.resolveActivity(intent, 0)
            resolveInfo == null
        } catch (e: Exception) {
            Log.e("NotificationsFragment", "Error checking Vivo auto-start permission", e)
            true
        }
    }

    private fun isHuaweiAutoStartPermissionGranted(): Boolean {
        return try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.huawei.systemmanager",
                    "com.huawei.systemmanager.startsupport.dialog.ExtraDialogActivity"
                )
                putExtra("package", context?.packageName)
            }
            val resolveInfo = context?.packageManager?.resolveActivity(intent, 0)
            resolveInfo == null
        } catch (e: Exception) {
            Log.e("NotificationsFragment", "Error checking Huawei auto-start permission", e)
            true
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
    }
}