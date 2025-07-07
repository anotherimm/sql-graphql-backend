# **Backend Sistem Perizinan Acara**

## **Project Overview**

Proyek ini adalah implementasi backend untuk Sistem Perizinan Acara menggunakan GraphQL. Terdapat dua peran utama: Operator (pembuat acara) dan Verifikator (pemeriksa acara), dengan business logic yang menerapkan role-based access control dan unit-based access control untuk proses verifikasi.

## **Tech Stack**

Berikut adalah teknologi dan versi yang digunakan dalam proyek ini:

Runtime: Node.js
Framework: Express.js
Database: MySQL
API: GraphQL
Library: graphql-http
Database Driver: mysql2
Auth: jsonwebtoken
Security: bcrypt.js

## **Setup dan Installation Instructions**

1.  **Clone Repository**

    git clone sql-graphql-backend
    cd sql-graphql-backend

2.  **Install Dependencies**
    Gunakan `npm` untuk menginstal semua paket yang dibutuhkan.

    npm install

3.  **Konfigurasi Environment**
    Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya dengan konfigurasi lokal Anda.

4.  **Setup Database**
    Pastikan server MySQL Anda berjalan, lalu buat database dan tabelnya. Lihat instruksi pada bagian **Database Setup**.

5.  **Jalankan Aplikasi**
    Gunakan skrip `dev` untuk menjalankan server dengan `nodemon`, yang akan otomatis me-restart saat ada perubahan file.

    npm run dev

    Server akan berjalan di `http://localhost:5000` atau port yang Anda tentukan di `.env`.

## **Database Setup**

Untuk menyiapkan database, ikuti langkah-langkah berikut:

1.  **Buat Database**
    Create tabel dengan nama backend_test
2.  **Buat Tabel **
    Buat tabel berdasarkan spesifikasi dokumen yang telah disediakan pada halaman MyAdmin MySQL

## **API Documentation **

Menggunakan Postman dengan klik new pada My Workspaces dan pilih GraphQl setelah itu masukkan endpont dan klik Query maka akan muncul susunan query dan mutation pada schema explorer

Endpoint Utama: http://localhost:5000/graphql
