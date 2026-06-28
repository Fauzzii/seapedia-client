# SEAPEDIA - Frontend Web Application (React + Vite)

Ini adalah antarmuka web modern untuk platform e-commerce multi-role SEAPEDIA. Aplikasi frontend dibangun menggunakan React, Vite, Tailwind CSS, Axios, dan TanStack React Query.

---

## 📋 Daftar Isi
1. [Fitur Utama Frontend](#-fitur-utama-frontend)
2. [Otomatisasi Upload WebP ke Supabase](#-otomatisasi-upload-webp-ke-supabase)
3. [Validasi Input Input Angka](#-validasi-input-input-angka)
4. [Sinkronisasi Sesi Reaktif (useAuthUser & Cache Sync)](#-sinkronisasi-sesi-reaktif-useauthuser--cache-sync)
5. [Desain Skeletons yang Konsisten](#-desain-skeletons-yang-konsisten)
6. [Halaman Layanan & Lini Masa Transaksi](#-halaman-layanan--lini-masa-transaksi)
7. [Code Splitting & Lazy Loading](#-code-splitting--lazy-loading)
8. [Konsistensi Desain Placeholder](#-konsistensi-desain-placeholder)
9. [Panduan Instalasi & Pengaturan Lingkungan](#-panduan-instalasi--pengaturan-lingkungan)
10. [Akun Demo Bawaan (Seed Data)](#-akun-demo-bawaan-seed-data)

---

## 👥 Fitur Utama Frontend

*   **Pemilihan Peran Aktif**: Memiliki modal visual intuitif pasca-login yang memblokir akses dashboard privat dan meminta pengguna memilih peran aktif jika pengguna tersebut memiliki peran lebih dari satu.
*   **Dasbor Multi-Role**: Mengubah konten visual secara dinamis (Buyer, Seller, Driver, Admin) sesuai dengan peran yang dipilih saat ini.
*   **Timeline Pesanan Visual & Retur Barang**: Menampilkan progres pelacakan status pesanan secara visual (PACKAGING ➔ WAITING_FOR_DRIVER ➔ IN_DELIVERY ➔ COMPLETED/RETURNED) serta tombol **Ajukan Retur Barang** untuk pesanan berstatus `COMPLETED`.
*   **Hover Dropdown Notifikasi & Cart**: Menyediakan panel hover dropdown dinamis di Navbar untuk melihat isi keranjang belanja secara langsung dan memantau pembaruan status log transaksi terbaru secara *realtime*.

---

## 🖼️ Otomatisasi Upload WebP ke Supabase

Untuk menghemat kuota transmisi dan penyimpanan penyimpanan awan:
1. Ketika penjual mengunggah foto produk di dasbor Seller, file gambar (PNG/JPEG) akan ditangkap secara lokal.
2. Frontend menggunakan elemen **HTML Canvas** untuk melakukan kompresi dan mengubah format gambar menjadi **format WebP** secara instan di sisi klien.
3. File WebP yang dihasilkan dikirim langsung dari klien ke **Supabase Storage Bucket `products`** menggunakan kunci anonim (`anon` key).
4. URL publik gambar kemudian dikirim sebagai data muatan ke backend.

---

## 🛡️ Validasi Input Angka (*Numeric Validation*)

Seluruh input numerik di aplikasi SEAPEDIA dilindungi secara berlapis:
*   Mencegah pengetikan karakter invalid (seperti `e`, `E`, `+`, `-`, atau `.`) di level browser melalui filter event `onKeyDown`.
*   Secara berkala melakukan pembersihan data (*data sanitization*) di level state via regex replacement pada event `onChange`.

Daftar input terlindungi meliputi:
*   Nominal Top-Up saldo dompet (Dashboard Pembeli)
*   Kuantitas barang di keranjang belanja
*   Harga & Stok produk (Dasbor Seller & Admin)
*   Nilai potongan diskon & kuota (Manajemen Voucher Admin)
*   Input hari simulasi percepat waktu (Dasbor Admin)
*   Nomor telepon penerima (Manajemen Alamat Pembeli)

---

## 🔄 Sinkronisasi Sesi Reaktif (useAuthUser & Cache Sync)

Otentikasi didesain agar tetap sinkron dan dinamis tanpa perlu memuat ulang (*reload*) halaman web secara manual:
1. Menggunakan *hook* kustom `useAuthUser` yang menyatukan pembacaan cache query `['authUser']` untuk menyinkronkan login, logout, atau perpindahan peran.
2. Saat ada perubahan peran aktif (*role select*) atau aktivitas belanja (menambah item ke keranjang), mutasi otomatis meng-update cache query terkait.
3. Navbar (seperti jumlah barang di keranjang dan link menu) serta visual portal dasbor akan ter-render ulang secara instan tanpa kedipan/reload halaman.

---

## 🎨 Desain Skeletons yang Konsisten

Untuk memberikan visual muat data (*loading experience*) yang premium dan konsisten di seluruh halaman, teks loader mentah (`Memuat...`) telah digantikan oleh kartu pulsing skeleton yang dirancang khusus:
*   **Driver Active Job Skeleton**: Mencegah lompatan tata letak (*layout jitter*) di dasbor Kurir saat sedang memuat data pengantaran aktif.
*   **Driver Jobs List Skeleton**: Menampilkan representasi pulsing baris penjemputan barang dan tombol ambil tugas.
*   **Buyer & Seller Orders List Skeleton**: Pulsing kerangka riwayat pemesanan lengkap dengan garis detail harga dan status.
*   **Product Review Skeleton**: Kerangka halaman ulasan produk dengan penanda form bintang dan area teks.

---

## 🚚 Halaman Layanan & Lini Masa Transaksi

*   **Halaman Layanan**: Dapat diakses melalui rute `/layanan` baik oleh pengunjung umum maupun melalui portal dasbor pribadi. Menjelaskan detail tentang 3 metode pengantaran (SLA Instant 3 Jam, Next Day 24 Jam, Regular 3 Hari), PPN 12%, kebijakan satu keranjang satu toko, dan bagi hasil kurir 80%.
*   **Lini Masa Transaksi**: Setiap status riwayat pesanan (`order_status_histories`) dipetakan secara kronologis di halaman Notifikasi dan Detail Pesanan, memberikan penjelasan transparan mengenai alasan perubahan status pesanan.

---

## 📦 Code Splitting & Lazy Loading

Untuk mempercepat pemuatan halaman pertama kali (*initial load time*) dan menghemat penggunaan kuota bundle size browser:
*   Semua rute halaman utama (Marketplace, Detail Produk, Cart, Checkout, dan Profile) diimpor secara dinamis menggunakan `React.lazy()`.
*   Pembagian chunk kode dibungkus dalam `React.Suspense` yang menampilkan indikator loading beranimasi transisi premium.

---

## 🎨 Konsistensi Desain Placeholder

Setiap data seed awal atau produk buatan pengguna yang tidak memiliki foto tidak akan memicu pemuatan gambar rusak (*broken image*). Frontend menyaring URL default (seperti `placehold.co`, `aida-public`, `googleusercontent`) dan merender sebuah **branded CSS placeholder** yang konsisten dengan logo SEAPEDIA (`bg-secondary/10 text-secondary`) lengkap dengan inisial nama produk.

---

## ⚙️ Panduan Instalasi & Pengaturan Lingkungan

### Prasyarat
*   Node.js versi 18 ke atas
*   NPM versi 9 ke atas

### Langkah-langkah Pengaturan

#### 1. Instalasi Dependensi
```bash
npm install
```

#### 2. Pengaturan Variabel Lingkungan (.env)
Buat file bernama `.env` di dalam folder root frontend:
```env
VITE_SUPABASE_URL="https://your_project_id.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anonymous_api_key"
```

#### 3. Menjalankan Aplikasi dalam Mode Pengembangan
```bash
npm run dev
```
Akses antarmuka web di browser Anda pada alamat [http://localhost:5173](http://localhost:5173).

---

## 👥 Akun Demo Bawaan (Seed Data)

| Peran Utama | Alamat Email | Kata Sandi | Saldo Awal (Seapay) | Catatan |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `Password123` | Rp 1.000.000 | Akses dasbor pemantau & sistem waktu |
| **BUYER 1** | `buyer1@example.com` | `Password123` | Rp 1.000.000 | Alamat: Jl. Mawar No. 10 |
| **BUYER 2** | `buyer2@example.com` | `Password123` | Rp 1.000.000 | Alamat: Jl. Melati No. 20 |
| **SELLER 1** | `seller1@example.com` | `Password123` | Rp 1.000.000 | Nama Toko: `Toko Enak` |
| **SELLER 2** | `seller2@example.com` | `Password123` | Rp 1.000.000 | Nama Toko: `Bob Bakery` |
| **DRIVER 1** | `driver1@example.com` | `Password123` | Rp 1.000.000 | Driver Terverifikasi |
| **DRIVER 2** | `driver2@example.com` | `Password123` | Rp 1.000.000 | Driver Terverifikasi |
| **MULTI-ROLE** | `multi@example.com` | `Password123` | Rp 1.000.000 | Memiliki Peran Pembeli & Penjual |
