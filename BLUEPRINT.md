# Blueprint & Struktur Direktori Outfit-Cek

Dokumen ini adalah cetak biru (*blueprint*) dari aplikasi web **Outfit-Cek**. Aplikasi ini dibangun menggunakan kerangka kerja **Next.js (App Router)**, **React**, **Tailwind CSS**, state management **Zustand**, dan backend/database **Supabase**.

Berikut adalah penjelasan menyeluruh tentang struktur file dan fungsionalitas dari setiap kode yang menyusun platform ini.

---

## 📂 Struktur Utama (`/src`)

Seluruh logika aplikasi utama berada di dalam folder `src/`. Terdapat 3 folder penting:
1. `app/` - Berisi *routing* halaman aplikasi (konsep App Router Next.js).
2. `components/` - Berisi komponen UI React yang dapat digunakan ulang (reusable).
3. `lib/` - Berisi *state management*, utilitas, fungsi logika (seperti sistem penilaian), dan konfigurasi database.
4. `middleware.ts` - Bertugas mencegat (intercept) request navigasi, biasanya untuk mengamankan halaman agar hanya bisa diakses user yang sudah login.

---

## 1. 📁 `src/app/` (Halaman & Routing)

Setiap folder di dalam `app/` merepresentasikan sebuah URL route di website.
- **`layout.tsx`**: Kerangka utama HTML untuk seluruh halaman. Biasanya berisi pemanggilan Navbar dan pengaturan tema (Dark/Light mode).
- **`page.tsx`**: Halaman utama (Landing Page / beranda) yang menjelaskan fitur-fitur Outfit-Cek.
- **`globals.css`**: File CSS global yang mengonfigurasi variabel-variabel tema warna dan utilitas dasar Tailwind.

### Sub-halaman (*Routes*):
- **`auth/`**: Berisi file-file actions (*server actions*) untuk menangani logika otentikasi (seperti proses login dan register ke Supabase).
- **`login/`** & **`register/`**: Halaman bagi pengguna untuk masuk ke akun atau membuat akun baru.
- **`wardrobe/`**: Halaman **Virtual Closet**. Di sini pengguna dapat melihat seluruh koleksi pakaian mereka yang telah diunggah.
- **`canvas/`**: Halaman **Mix and Match** (sebelumnya Layer Slider). Tempat pengguna merancang gaya OOTD secara visual dengan menggeser kategori atasan, luaran, bawahan, dan alas kaki.
- **`recommend/`**: Halaman **Lookmatch** (sebelumnya AI Stylist). Halaman untuk meminta rekomendasi gaya otomatis sesuai dengan tema (seperti *Work*, *Date Night*, atau *Casual*).
- **`calendar/`**: Halaman **Planner**. Menampilkan jadwal mingguan untuk merencanakan outfit hari demi hari.
- **`lookbook/`**: Halaman komunitas atau etalase gaya untuk melihat daftar seluruh OOTD yang pernah dirancang dan disimpan oleh pengguna.

---

## 2. 📁 `src/components/` (Komponen UI)

Bagian ini menyimpan potongan antarmuka yang dirakit untuk membuat halaman penuh.
- **`ui/`**: Berisi komponen-komponen antarmuka dasar dan generik seperti Tombol (`Button`), Input teks, dan Dropdown (`Select`). Komponen di dalam sini biasanya di-generate oleh pustaka seperti `shadcn/ui` atau `Base UI`.
- **`navbar.tsx`**: Komponen navigasi atas web yang menampilkan logo, link antar halaman, dan menu *Logout*.
- **`layer-slider.tsx`**: Inti dari fitur **Mix and Match**. Merupakan komponen carousel di mana user dapat menggeser berbagai pilihan baju, dan akan berinteraksi dengan AI Score di sebelahnya.
- **`color-palette-guide.tsx`**: Menampilkan ringkasan analitik gaya dari paduan pakaian yang sedang dipilih. Terdapat indikator visual dari palet warna dan pesan AI.
- **`weekly-planner.tsx`**: Antarmuka untuk sistem penandaan hari (*Weekly Planner*). Memungkinkan pengguna menjadwalkan OOTD tertentu ke hari Senin-Minggu berikutnya.
- **`theme-recommendations.tsx`**: Bertugas mengambil dan merender hasil perpaduan pakaian cerdas berdasarkan tema yang dipilih dari halaman **Lookmatch**.
- **`wardrobe-grid.tsx`**: Menampilkan pakaian user dalam format *grid* bergaya galeri Pinterest pada halaman Wardrobe.
- **`upload-dialog.tsx`**: Komponen *modal/popup* yang muncul ketika user ingin mengunggah dan menambahkan foto baju baru ke *Virtual Closet*.
- **`fitting-room.tsx`**, **`canvas-sidebar.tsx`**, **`canvas-workspace.tsx`**: Potongan layout pendukung untuk mengatur tata letak area kerja (workspace) pencocokan baju.
- **`theme-provider.tsx`**: Komponen pembungkus (wrapper) untuk mengaktifkan fitur ubah tema (Gelap/Terang) bawaan Next Themes.

---

## 3. 📁 `src/lib/` (Sistem Logika & State)

Folder yang menjalankan "otak" aplikasi di balik layar.
- **`store.ts`**: Pusat *State Management* (menggunakan Zustand). Ini adalah jantung penyimpanan sementara data di frontend. Ia mengingat daftar pakaian yang sudah di-load, pakaian apa yang sedang aktif dipilih di canvas/Mix and Match, hari apa saja yang sudah dijadwalkan di *Planner*, serta kombinasi pakaian (outfit) yang telah tersimpan.
- **`style-scorer.ts`**: Mesin kalkulasi **Style Score** dan **Color Harmony**. Berisi aturan `COLOR_FAMILIES` (kamus kecocokan warna). Saat user menggeser slider, sistem ini dipanggil untuk mengecek harmoni warna, menganalisa kategori pakaian yang menumpuk, dan memberikan feedback teks dinamis berdasarkan kesesuaiannya.
- **`supabase/`**: Berisi file pengaturan koneksi ke database Supabase (Client dan Server). Memastikan komunikasi pengiriman atau pengambilan data baju / user aman.
- **`utils.ts`**: Fungsi-fungsi bantuan utilitas, yang paling umum adalah fungsi penggabung *class CSS* Tailwind (`cn`) agar komponen responsif dan dinamis.

---

## 🚀 Alur Kerja Singkat (Contoh: Menjadwalkan OOTD)

1. User mendarat di `src/app/canvas/page.tsx` (**Mix and Match**).
2. Tampilan dirender oleh `src/components/layer-slider.tsx`. User menggeser jaket dan celana.
3. State (jaket & celana yang dipilih) dicatat sementara di memori oleh `src/lib/store.ts`.
4. Secara otomatis, `src/lib/style-scorer.ts` membaca memori tersebut, mencocokkan warnanya, lalu mengembalikan nilai 85/100 dan komentar *"Kontras warna yang sangat baik!"*.
5. Nilai 85 tersebut ditampilkan oleh komponen `src/components/color-palette-guide.tsx`.
6. User mengklik **"Jadwalkan OOTD"**. Data dikirim lagi ke `src/lib/store.ts` sebagai "Saved Outfit".
7. Aplikasi me-routing (memindah) layar ke halaman `src/app/calendar/page.tsx` dan merender `src/components/weekly-planner.tsx` yang meminta user memilih hari, lalu data tersebut diikat dengan jadwal kalender yang sesungguhnya.

---
*Blueprint ini memberikan struktur mental (mental model) dari setiap titik pada codebase Outfit-Cek. Saat Anda ingin mengubah hal terkait tampilan pergi ke `components/`, untuk logika pergi ke `lib/`, dan untuk URL halaman pergi ke `app/`.*
