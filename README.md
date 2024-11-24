# Backend API untuk SkinOry

Ini adalah aplikasi backend untuk proyek **SkinOry**, yang berfungsi sebagai API untuk melakukan autentikasi pengguna dan pengelolaan data terkait pengguna.

## Fitur

- **Registrasi Pengguna** - Pengguna baru dapat mendaftar dengan mengirimkan data yang diperlukan (misalnya nama, email, password).
- **Login Pengguna** - Pengguna dapat login menggunakan kredensial yang valid untuk mendapatkan token autentikasi.
- **Endpoint yang Dilindungi** - Menggunakan middleware untuk melindungi endpoint yang membutuhkan autentikasi token JWT.
- **Adding Product** - Endpoint untuk menambah product (bukan untuk user).
- **Pengelolaan Skincare Routine** - Endpoint untuk mengambil, mengedit, atau menghapus data pengguna.

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

### Middleware
**Error Active Token**:

  ```json
  {
    "status": 401,
    "message": "Access Token Required"
  }
  ```

**Error Expired Token**:

  ```json
  {
    "status": 403,
    "message": "Invalid or Expired Token"
  }
  ```

**Error Format Active Token**:
  #### Authorization: Bearer <active_token>
  ```json
  {
    "status": 401,
    "message": "Invalid Token Format"
  }
  ```

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

  **Response**:

  ```json
  {
    "message": "Registrasi Successfully"
  }
  ```

  **Error Email Used**:

  ```json
  {
    "status": 400,
    "message": "Email Already Exist"
  }
  ```

  **Error Server**:

  ```json
  {
    "status": 500,
    "message": "An unexpected error occurred during registration."
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
    "message": "Login Successfully",
    "loginResult": {
        "userID": "user.id",
        "username": "user.username",
        "active_token": "activeToken" 
      } 
  }
  ```
  ## **Cookies**
  ## Set-Cookie: refresh_token=<your_refresh_token>; HttpOnly; Path=/; Secure

  **Error User**:

  ```json
  {
    "status": 404,
    "message": "User Not Found"
  }
  ```

  **Error Password**:

  ```json
  {
    "status": 400,
    "message": "Incorrect Password"
  }
  ```

  **Error Server**:

  ```json
  {
    "status": 500,
    "message": "An unexpected error occurred during registration."
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
    "message": "Product Added Successfully"
  }
  ```

  **Error Missing Required Fields**:

  ```json
  {
    "status": 400,
    "message": "All fields are required: name_product, skin_type, category, usage_time, image_url, price, rating"
  }
  ```

  **Error Product Already Exists**:

  ```json
  {
    "status": 400,
    "message": `Product "${name_product}" for usage time "${usage_time}" already exists`
  }
  ```

  **Error Missing Required Fields**:

  ```json
  {
    "status": 500,
    "message": "Failed to add product",
    "error": "Detailed error message from the server"
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

  **Error Bad Request**:

  ```json
  {
    "status": 400,
    "message": "User ID is required"
  }
  ```

  **Error Internal Server**:

  ```json
  {
    "status": 500,
    "message": "Error fetching user routines",
    "error": "Error message"
  }
  ```

### 5. **Product Recommendation List**

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

  **Error Bad Request**:

  ```json
  {
    "status": 400,
    "message": "User ID, Usage Time, and Category are required"
  }
  ```

  **Error Internal Server**:

  ```json
  {
    "status": 500,
    "message": "Error fetching recommended products",
    "error": "Error message"
  }
  ```

### 6. **Add Skincare Routine**

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

  **Error Bad Request**:

  ```json
  {
    "status": 400,
    "message": "User ID, Product ID, usage time, and category are required"
  }
  ```

  ```json
  {
    "status": 400,
    "message": "User not found"
  }
  ```

  ```json
  {
    "status": 400,
    "message": "Product not found"
  }
  ```

  ```json
  {
    "status": 400,
    "message": "Skin type mismatch: Product skin type is 'oily' but user's skin type is 'dry'"
  }
  ```

  ```json
  {
    "status": 400,
    "message": "Product does not match the provided category 'facewash' and usage time 'morning'"
  }
  ```

  ```json
  {
    "status": 400,
    "message": "Routine already exists"
  }
  ```

  **Error Internal Server**:

  ```json
  {
    "status": 500,
    "message": "Error adding routine",
    "error": "Error message"
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

  **Error Bad Request**:

  ```json
  {
    "status": 400,
    "message": "User ID, Product ID, and Applied status are required"
  }
  ```

  ```json
  {
    "status": 400,
    "message": "Invalid value for applied. Allowed values: 'true', 'false'"
  }
  ```

  ```json
  {
    "status": 400,
    "message": "Routine not found for the given user ID and product ID"
  }
  ```
  **Error Internal Server**:

  ```json
  {
    "status": 500,
    "message": "Error updating applied status",
    "error": "Error message"
  }
  ```

### 8. **Refresh Token**

- **URL**: `/refresh`
- **Metode**: `POST`
- **Response**:

  ```json
  {
    "message": "Token Updated"
    "loginResult": {
        "userID": "user.id",
        "username": "user.username",
        "active_token": "activeToken" 
      } 
  }
  ```

  **Error User**:

  ```json
  {
    "status": 404,
    "message": "User Not Found"
  }
  ```

  **Error Invalid Token**:
  ```json
  {
    "status": 403,
    "message": "Invalid Refresh Token'"
  }
  ```

  **Error Expired Refresh Token**:

  ```json
  {
    "status": 500,
    "message": "Invalid or Expired Refresh Token"
  }
  ```
##
