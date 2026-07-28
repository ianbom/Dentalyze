# Analisis Codebase DentrographAI

## Ringkasan

DentrographAI adalah aplikasi web untuk manajemen dan analisis radiograf panoramik gigi. Sistem ini mengelola pasien, dokter, radiografer, unggahan citra radiograf, deteksi gigi berbasis AI, verifikasi hasil oleh dokter, serta pembuatan laporan PDF dengan QR code untuk validasi publik.

Codebase terbagi menjadi dua bagian utama:

- `dentograph-web`: aplikasi web Laravel + Inertia + React.
- `dentograph-yolo`: folder dependensi/model AI eksternal. Saat ini hanya berisi `requirements.txt`, tetapi `dentograph-web/ai_service/flask_app.py` mengarah ke file model di folder ini.

## Fungsi Utama Web

Aplikasi ini dibuat untuk workflow klinis radiografi gigi:

1. Admin mengelola user sistem, dokter, radiografer, dan data pasien.
2. Radiografer membuat data pasien dan mengunggah radiograf panoramik.
3. Dokter atau admin menjalankan analisis AI terhadap radiograf.
4. Service AI mendeteksi nomor gigi FDI memakai YOLO dan mengklasifikasikan kondisi gigi memakai Vision Transformer.
5. Dokter meninjau hasil AI, dapat mengaktifkan/nonaktifkan atau menambah hasil manual, lalu memfinalisasi radiograf.
6. Radiograf terverifikasi dapat dibuat menjadi laporan PDF.
7. QR code di laporan mengarah ke halaman verifikasi publik untuk memeriksa keaslian dokumen.
8. Pasien dapat melihat dashboard dan histori radiograf miliknya.

## Role Pengguna

Sistem memakai kolom `role` pada tabel `users`.

Role yang ada:

- `admin`: akses administrasi penuh, statistik global, user/staff/pasien/radiograf.
- `radiografer`: membuat pasien, mengunggah radiograf, melihat hasil pekerjaan.
- `dokter`: menjalankan analisis AI, memverifikasi hasil, finalisasi laporan.
- `pasien`: melihat profil, radiograf terbaru, histori, dan status hasil.

Login dimodifikasi lewat `FortifyServiceProvider`:

- Staff login dengan email.
- Pasien login dengan NIK 16 digit.
- Password awal pasien dibuat dari NIK saat data pasien dibuat.

## Technology Stack

Backend:

- PHP `^8.3`
- Laravel `^13.7`
- Laravel Fortify untuk autentikasi, reset password, email verification, dan 2FA
- Inertia Laravel `^3.0`
- Laravel Wayfinder
- Pest `^4.7` untuk testing
- Laravel Pint untuk format PHP

Frontend:

- React `^19.2`
- TypeScript `^5.7`
- Inertia React `^3.0`
- Vite `^8.0`
- Tailwind CSS `^4.0`
- Radix UI primitives
- lucide-react untuk icon
- sonner untuk toast
- ESLint dan Prettier

AI service:

- Python Flask
- PyTorch dan Torchvision
- Ultralytics YOLO
- Hugging Face Transformers
- OpenCV
- Pillow
- NumPy

PDF dan verifikasi:

- `BaconQrCode` untuk QR code.
- `SimplePdfService` membuat PDF manual tanpa library DOMPDF.

## Struktur Direktori

```text
DentrographAI/
├── CODEBASE.md
├── package-lock.json
├── dentograph-web/
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Http/Requests/
│   │   ├── Models/
│   │   ├── Providers/
│   │   └── Services/
│   ├── ai_service/
│   │   ├── flask_app.py
│   │   └── requirements.txt
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   │   ├── css/
│   │   ├── js/
│   │   └── views/
│   ├── routes/
│   └── tests/
└── dentograph-yolo/
    └── requirements.txt
```

## Backend Laravel

### Routing

Route utama ada di `dentograph-web/routes/web.php`.

Public routes:

- `/`: landing page Inertia `welcome`.
- `/verify/{radiograph}`: verifikasi publik dokumen radiograf.

Protected routes memakai middleware `auth` dan `verified`:

- `/dashboard`: dashboard sesuai role.
- `/patients`: CRUD pasien.
- `/radiographs`: unggah, lihat, hapus radiograf.
- `/radiographs/{radiograph}/analyze`: jalankan AI.
- `/radiographs/{radiograph}/finalize`: finalisasi hasil dokter.
- `/detection`: daftar hasil deteksi.
- `/verification/tasks`: antrean verifikasi dokter.
- `/reports/radiographs/{radiograph}/pdf`: preview laporan.
- `/reports/radiographs/{radiograph}/download`: download PDF.
- `/doctors` dan `/radiographers`: manajemen staff.

Settings routes ada di `dentograph-web/routes/settings.php`:

- profile
- password
- security / 2FA
- appearance

### Model Domain

`User`

- Menyimpan akun semua role.
- Field utama: `name`, `email`, `phone`, `role`, `password`.
- Relasi: `hasOne(Patient::class)`.

`Patient`

- Detail pasien.
- Field utama: `nik`, `user_id`, `birth_place`, `birth_date`, `address`, `age`, `gender`.
- Relasi: `belongsTo(User::class)`.

`Radiograph`

- Data pemeriksaan radiograf.
- Primary key string: `id_radiograph`.
- Field utama: `id_dokter`, `id_radiografer`, `patient_nik`, `image`, `result_image`, `status`.
- Relasi:
  - `patient`: ke `Patient` lewat `patient_nik`.
  - `detections`: banyak hasil deteksi.
  - `dokter`: user dokter.
  - `radiografer`: user radiografer.

`Detection`

- Hasil deteksi per gigi.
- Field utama: `id_radiograph`, `no_fdi`, `abnormality`, `analysis`, `bbox`, `crop_image`, `confidence`, `is_active`, `source`.
- `bbox` cast ke array, `confidence` ke float, `is_active` ke boolean.

### Database

Tabel utama:

- `users`: akun semua role.
- `patients`: data detail pasien, NIK unik 16 digit.
- `radiographs`: pemeriksaan radiograf, file citra, status verifikasi.
- `detections`: hasil AI/manual per gigi.
- `sessions`, `password_reset_tokens`, `cache`, `jobs`: tabel bawaan Laravel.

Status radiograf yang dipakai:

- `menunggu`: belum final atau menunggu verifikasi.
- `terverifikasi`: sudah difinalisasi dokter.

Ada normalisasi status lama:

- `draft` dan `analyzed` dipetakan ke `menunggu`.
- `verified` dipetakan ke `terverifikasi`.

## Service Layer

Backend memakai service classes agar controller tetap tipis.

`DashboardService`

- Menyusun data dashboard berdasarkan role.
- Admin melihat statistik global, aktivitas dokter/radiografer, grafik mingguan/bulanan.
- Radiografer melihat pasien terbaru dan deteksi yang selesai.
- Dokter melihat antrean verifikasi dan pekerjaan selesai.
- Pasien melihat profil, radiograf terbaru, histori, dan skor kesehatan sederhana.

`PatientService`

- CRUD pasien.
- Membuat akun user role `pasien` bersamaan dengan data `patients`.
- Menghapus pasien juga menghapus user terkait lewat transaction.
- Menyediakan histori radiograf pasien.

`RadiographService`

- Daftar radiograf, detail radiograf, history index.
- Membuat ID radiograf format `RAD-YYYYMMDDHHMMSS-XXXX`.
- Menyimpan file radiograf ke disk `public` folder `radiographs`.
- Menghitung jumlah gigi terdeteksi dan estimasi gigi hilang.

`AiDetectionService`

- Mengirim payload radiograf ke Flask `/predict`.
- Membuat folder `radiographs/results` dan `radiographs/crops/{id}`.
- Normalisasi response AI menjadi format `Detection`.
- Mengatur timeout dari `config/services.php`.

`VerificationService`

- Membuat daftar tugas verifikasi untuk dokter/admin.
- Finalisasi radiograf:
  - validasi minimal ada deteksi aktif,
  - hapus deteksi lama,
  - simpan deteksi final,
  - set dokter pemeriksa,
  - set `result_image`,
  - ubah status ke `terverifikasi`.

`ReportService`

- Menyusun data laporan radiograf terverifikasi.
- Membuat QR code untuk URL `/verify/{radiograph}`.

`SimplePdfService`

- Membuat file PDF mentah dari command drawing.
- Memasukkan ringkasan pasien, radiograf, odontogram FDI, detail temuan, gambar, dan QR code.

`PublicVerificationService`

- Mengecek apakah radiograf ada dan statusnya `terverifikasi`.
- Menampilkan ringkasan dengan nama pasien dimasking.

## AI Service

File utama: `dentograph-web/ai_service/flask_app.py`.

Endpoint:

- `GET /health`: health check.
- `POST /predict`: menerima path gambar dan folder output, lalu menjalankan inference.

Model:

- YOLO untuk mendeteksi posisi gigi.
- ViT image classification untuk klasifikasi kondisi tiap crop gigi.

Label FDI:

- Gigi dipetakan ke nomor FDI 11-18, 21-28, 31-38, 41-48.

Label kondisi:

- `Impaksi`
- `Karies`
- `LesiPeriapikal`
- `Normal`
- `Resorpsi`

Output AI:

- `results`: array hasil per gigi.
- `result_image`: path gambar radiograf dengan bounding box dan label.

Setiap hasil berisi:

- `no_fdi`
- `abnormality`
- `analysis`
- `bbox`
- `confidence`
- `crop_image`
- `source`

Environment AI penting:

- `AI_SERVICE_URL` di Laravel, default `http://127.0.0.1:5000`
- `AI_SERVICE_TIMEOUT`, default `300`
- `AI_SERVICE_CONNECT_TIMEOUT`, default `10`
- `YOLO_MODEL_PATH`
- `VIT_MODEL_PATH`
- `CONF_YOLO`
- `NMS_IOU_THRESHOLD`
- `AI_SERVICE_HOST`
- `AI_SERVICE_PORT`
- `AI_PRELOAD_MODELS`

Catatan: default path model di `flask_app.py` mengarah ke drive Windows `D:\LARAGON\...`. Pada environment lain, path ini perlu dioverride lewat environment variable.

## Frontend React/Inertia

Frontend ada di `dentograph-web/resources/js`.

Struktur penting:

- `pages/`: halaman Inertia.
- `components/`: komponen reusable.
- `components/ui/`: komponen UI berbasis Radix/shadcn style.
- `layouts/`: layout app, auth, settings.
- `hooks/`: helper React hook.
- `types/`: type declaration.
- `app.tsx`: entrypoint React/Inertia.

Halaman utama:

- `welcome.tsx`: landing page.
- `dashboard/index.tsx`: memilih dashboard sesuai role.
- `dashboard/AdminDashboard.tsx`
- `dashboard/RadiographerDashboard.tsx`
- `dashboard/DoctorDashboard.tsx`
- `dashboard/PatientDashboard.tsx`
- `patients/*`: daftar, create, edit, show, history, insight.
- `detection/index.tsx` dan `detection/show.tsx`: daftar dan detail radiograf/deteksi.
- `radiographs/*`: create, index, show, history.
- `verification/tasks.tsx`: tugas verifikasi.
- `reports/radiograph-pdf.tsx`: tampilan laporan.
- `public/verify-result.tsx`: hasil verifikasi publik.
- `auth/*`: login, register, reset password, email verification, 2FA challenge.
- `settings/*`: profile, security, appearance.
- `doctors/index.tsx` dan `radiographers/index.tsx`: staff directory.

Navigation di `layouts/app-layout.tsx` memfilter menu berdasarkan role.

## Alur Data Radiograf

1. Radiografer membuka halaman radiograf/detection.
2. Radiografer memilih pasien dan upload file `jpg`, `jpeg`, atau `png`, maksimal 10 MB.
3. `RadiographService::create()` menyimpan file ke storage public.
4. Record `radiographs` dibuat dengan status `menunggu`.
5. Dokter/admin membuka detail radiograf dan menjalankan analyze.
6. `AiDetectionService` POST ke Flask `/predict`.
7. Flask membaca gambar, menjalankan YOLO, crop tiap gigi, klasifikasi ViT, menyimpan crop dan result image.
8. Laravel menerima hasil sebagai preview session atau JSON.
9. Dokter memfinalisasi deteksi lewat `VerificationService::finalize()`.
10. Deteksi final disimpan ke tabel `detections`.
11. Status radiograf berubah menjadi `terverifikasi`.
12. Laporan PDF bisa dipreview, diunduh, dan diverifikasi via QR.

## Validasi dan Otorisasi

Validasi memakai Form Request:

- `StoreRadiographRequest`: `patient_nik` wajib 16 digit, gambar wajib `jpg/jpeg/png`, max 10 MB.
- `AnalyzeRadiographRequest`: hanya `admin` dan `dokter`.
- `FinalizeRadiographRequest`: hanya `admin` dan `dokter`, validasi struktur deteksi final.
- `StorePatientRequest` dan `UpdatePatientRequest`: validasi data pasien.
- Request user/staff/settings juga dipisah per domain.

Sebagian otorisasi dilakukan di Form Request, sebagian masih di controller memakai `abort_unless()` dan pengecekan role manual.

## Storage dan File

File disimpan di disk `public`.

Path penting:

- `storage/app/public/radiographs`: file radiograf asli.
- `storage/app/public/radiographs/results`: gambar hasil AI dengan bounding box.
- `storage/app/public/radiographs/crops/{radiographId}`: crop gigi per radiograf.
- `storage/app/public/reports/qr`: QR code laporan.

Laravel perlu `php artisan storage:link` agar file public bisa diakses lewat `/storage/...`.

## Testing dan Quality

Framework testing:

- Pest untuk PHP tests.
- PHPUnit config di `phpunit.xml`.
- ESLint, Prettier, TypeScript untuk frontend.
- Pint untuk PHP style.

Test yang tersedia:

- Auth flow: login, registration, reset password, email verification, 2FA.
- Settings: profile dan security.
- Dashboard.
- Backend structure.
- Example unit/feature tests.

Command penting:

```bash
composer setup
composer dev
composer test
composer ci:check
npm run dev
npm run build
npm run build:ssr
npm run lint:check
npm run format:check
npm run types:check
```

Untuk AI service:

```bash
cd dentograph-web/ai_service
pip install -r requirements.txt
python flask_app.py
```

## Konfigurasi Penting

Laravel:

- `.env` diperlukan.
- `APP_KEY` harus dibuat.
- Database dikonfigurasi di `.env`.
- `AI_SERVICE_URL` harus menunjuk ke Flask service.
- Queue tersedia, dan `composer dev` menjalankan `queue:listen`.

AI:

- Pastikan file model YOLO dan ViT tersedia.
- Override path model dengan `YOLO_MODEL_PATH` dan `VIT_MODEL_PATH` jika lokasi berbeda.
- Jika inference lama, naikkan `AI_SERVICE_TIMEOUT`.
- Jika memakai GPU, PyTorch akan memilih CUDA otomatis bila tersedia.

## Catatan Risiko dan Hal yang Perlu Diperhatikan

- Otorisasi masih berbasis string role manual, belum memakai Policy/Gate terpusat.
- `UserService` masih placeholder dan belum berisi implementasi CRUD nyata.
- `User` mengimpor `TwoFactorAuthenticatable`, tetapi trait tidak dipakai di class. Fitur 2FA mungkin perlu dicek ulang bila flow 2FA diharapkan aktif penuh.
- `composer.json` tidak menampilkan `bacon/bacon-qr-code` secara langsung, tetapi `composer.lock` berisi package tersebut. Jika install bersih gagal, tambahkan package eksplisit.
- Default path model AI masih hardcoded ke path Windows lokal. Deployment butuh environment variable.
- `SimplePdfService` membuat PDF manual. Ini ringan, tetapi lebih sulit dipelihara dibanding library PDF umum.
- Beberapa migration punya formatting tidak konsisten, tetapi struktur tabel tetap terbaca.
- `dentograph-yolo/requirements.txt` kosong, sementara dependensi AI ada di `dentograph-web/ai_service/requirements.txt`.

## Kesimpulan

DentrographAI adalah sistem web klinis untuk deteksi dan verifikasi radiograf gigi berbasis AI. Laravel menjadi backend utama, Inertia React menjadi frontend SPA-like tanpa API terpisah penuh, dan Flask menjadi microservice AI untuk inference YOLO + ViT. Fokus domainnya jelas: mengelola pasien, radiograf, deteksi kondisi gigi, verifikasi dokter, laporan PDF, dan validasi dokumen publik.

