# Backend API untuk SkinOry

Ini adalah aplikasi backend untuk proyek **SkinOry**, yang berfungsi sebagai API untuk melakukan autentikasi pengguna dan pengelolaan data terkait pengguna.

## Fitur

- **Registrasi Pengguna** - Pengguna baru dapat mendaftar dengan mengirimkan data yang diperlukan (misalnya nama, email, password).
- **Login Pengguna** - Pengguna dapat login menggunakan kredensial yang valid untuk mendapatkan token autentikasi.
- **Endpoint yang Dilindungi** - Menggunakan middleware untuk melindungi endpoint yang membutuhkan autentikasi token JWT.
- **Pengelolaan Pengguna** - Endpoint untuk mengambil, mengedit, atau menghapus data pengguna.

## Teknologi yang Digunakan

- **Node.js** - Runtime JavaScript untuk server.
- **Express.js** - Framework untuk membangun aplikasi web dan API.
- **JWT (JSON Web Token)** - Untuk autentikasi dan otorisasi.
- **MySQL** - Database untuk menyimpan data pengguna.
- **dotenv** - Untuk menyimpan variabel lingkungan yang sensitif (seperti kunci JWT, konfigurasi database).
- **ESLint** - Linter untuk memastikan kualitas kode yang konsisten.

## Instalasi

### Prasyarat

Pastikan Anda telah menginstal **Node.js** dan **npm** (Node Package Manager) di sistem Anda.

### Langkah-langkah Instalasi

1. **Clone repositori:**

   ```bash
   git clone https://github.com/Ar1veeee/Backend_SkinOry_CC.git
   ```

2. **Instal dependensi:**
   Masuk ke dalam direktori proyek dan jalankan perintah berikut untuk menginstal semua dependensi yang dibutuhkan.

   ```bash
   cd Backend_SkinOry_CC
   npm install
   ```

3. **Konfigurasi variabel lingkungan:**
   Salin file `.env.example` menjadi `.env` dan sesuaikan nilai variabel lingkungan sesuai dengan konfigurasi Anda.

   ```bash
   cp .env.example .env
   ```

   Di dalam `.env`, sesuaikan dengan pengaturan database Anda dan kunci JWT:

   ```ini
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=skinory
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. **Menjalankan aplikasi:**
   Setelah instalasi selesai dan konfigurasi diatur, jalankan aplikasi dengan perintah berikut:

   ```bash
   npm start
   ```

   Secara default, aplikasi akan berjalan di port 5000. Anda dapat mengaksesnya melalui `http://localhost:5000`.

## Endpoints

## Autentikasi

### 1. **Registrasi Pengguna**

- **URL**: `/auth/register`
- **Metode**: `POST`
- **Body**:
  ```json
  {
    "username": "nama_pengguna",
    "email": "email@example.com",
    "password": "password123"
  }
  ```

### 2. **Login Pengguna**

- **URL**: `/auth/login`
- **Metode**: `POST`
- **Body**:
  ```json
  {
    "email": "email@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login berhasil",
    "active_token": "expected_active_token",
    "refresh_token": "expected_refresh_token"
  }
  ```

## Endpoint yang Dilindungi

### 3. **Add Product**

- **URL**: `/product`
- **Metode**: `POST`
- **Body**:

  ```json
  {
    "name_product": "Jaya Toner",
    "skin_type": "oily",
    "category": "toner",
    "usage_time": "night",
    "image_url": "link_image",
    "price": 20000,
    "rating": 4.7
  }
  ```

- **Response**:

  ```json
  {
    "message": "Product added successfully"
  }
  ```

### 4. **Skincare Routine List**

- **URL**: `/routine/:user_id`
- **Metode**: `GET`
- **Response**:

  ```json
  {
    "routines": [
      {
        "id_product": 1,
        "name_product": "Jaya Toner",
        "usage_time": "night",
        "applied": "true",
        "skin_type": "dry"
      }
    ]
  }
  ```

### 5. **Lihat Rekomendasi Produk**

- **URL**: `/routine/:user_id/:usage_time/:category`
- **Metode**: `GET`
- **Response**:

  ```json
  {
    "products": [
      {
        "id_product": 2,
        "name_product": "Jaya Toner",
        "skin_type": "dry",
        "category": "toner",
        "usage_time": "night",
        "image_url": "ceritanya link",
        "price": "20000.00",
        "rating": "4.70",
        "created_at": "2024-11-22T09:07:21.000Z"
      },
      {
        "id_product": 3,
        "name_product": "Skintific Toner",
        "skin_type": "dry",
        "category": "toner",
        "usage_time": "night",
        "image_url": "ceritanya link",
        "price": "20000.00",
        "rating": "4.70",
        "created_at": "2024-11-23T10:23:57.000Z"
      },
      {
        "id_product": 4,
        "name_product": "Alief Toner",
        "skin_type": "dry",
        "category": "toner",
        "usage_time": "night",
        "image_url": "ceritanya link",
        "price": "20000.00",
        "rating": "4.70",
        "created_at": "2024-11-23T10:24:10.000Z"
      }
    ]
  }
  ```

### 6. **Tambah Skincare Routine**

- **URL**: `/routine/:user_id/:usage_time/:category`
- **Metode**: `POST`
  **Body**:
  ```json
  {
    "product_id": 2
  }
  ```
- **Response**:

  ```json
  {
    "message": "Routine added successfully",
    "product": {
      "id_product": 2,
      "name_product": "Example Product",
      "skin_type": "oily",
      "category": "toner",
      "usage_time": "night",
      "image_url": "link_image",
      "price": 20000,
      "rating": 4.7,
      "created_at": "2024-11-22T09:07:10.000Z"
    }
  }
  ```

### 7. **Update Applied Skincare**

- **URL**: `/routine/:user_id/:product_id`
- **Metode**: `PATCH`
  **Body**:
  ```json
  {
    "applied": true
  }
  ```
- **Response**:

  ```json
  {
    "message": "Applied status updated successfully"
  }
  ```

##
