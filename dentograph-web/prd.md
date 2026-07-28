# PRD — DeTech App / Dentograph

## Dental Technology Application berbasis Laravel 13

**Versi Dokumen:** 1.0  
**Tanggal:** 13 Mei 2026  
**Target Framework:** Laravel 13  
**Frontend:** React + TypeScript + Inertia.js  
**AI Service:** FastAPI Python API
**Database:** MySQL / PostgreSQL

---

## 1. Ringkasan Produk

**Nama Produk:** DeTech App / Dentograph  
**Jenis Aplikasi:** Web-based dental radiograph AI detection system  
**Target Pengguna:** Admin, radiografer, dokter, dan pasien

DeTech App adalah sistem berbasis web untuk membantu proses deteksi gigi susu pada foto rontgen panoramik menggunakan teknologi AI/Machine Learning. Sistem ini digunakan oleh radiografer untuk mengunggah foto rontgen, dokter untuk memverifikasi hasil deteksi AI, admin untuk mengelola sistem, dan pasien untuk melihat hasil pemeriksaan mereka.

Alur utama sistem:

```txt
Upload foto rontgen
↓
Analisis AI melalui FastAPI API
↓
Review dan verifikasi oleh dokter
↓
Hasil pemeriksaan tersedia untuk pasien
↓
PDF report dengan QR Code
↓
Verifikasi publik melalui halaman khusus
```

---

## 2. Tujuan Produk

Tujuan utama website ini adalah:

1. Membantu tenaga medis mendeteksi gigi susu pada foto panoramik.
2. Mempercepat proses analisis awal menggunakan AI.
3. Memberikan ruang validasi manual oleh dokter.
4. Menyediakan hasil pemeriksaan yang bisa diakses pasien.
5. Menyediakan laporan PDF dengan QR Code untuk verifikasi publik.
6. Mengelola data pasien, radiografer, dokter, dan riwayat deteksi secara terstruktur.

---

## 3. Masalah yang Ingin Diselesaikan

Proses analisis foto rontgen panoramik dapat memakan waktu dan bergantung pada pemeriksaan manual. Dengan sistem ini:

- Radiografer dapat mengunggah data pasien dan foto rontgen secara digital.
- AI membantu mendeteksi kandidat gigi susu.
- Dokter tetap menjadi pihak validasi akhir.
- Pasien dapat melihat hasil pemeriksaan secara mandiri.
- Hasil pemeriksaan dapat diverifikasi melalui QR Code.

---

## 4. Target Pengguna

### 4.1 Admin

Admin bertugas mengelola sistem secara keseluruhan.

Kebutuhan admin:

- Melihat dashboard statistik.
- Mengelola data dokter.
- Mengelola data radiografer.
- Mengelola data pasien.
- Melihat semua riwayat deteksi.
- Mengakses detail hasil deteksi.
- Melakukan monitoring aktivitas sistem.

### 4.2 Radiografer

Radiografer bertugas mengunggah foto rontgen dan menginput data pasien.

Kebutuhan radiografer:

- Melihat dashboard ringkas.
- Menambahkan data pasien.
- Mengunggah foto rontgen panoramik.
- Melihat detail hasil deteksi.
- Melihat riwayat pemeriksaan.
- Melihat data pasien.

### 4.3 Dokter

Dokter bertugas memverifikasi hasil deteksi AI.

Kebutuhan dokter:

- Melihat dashboard dokter.
- Melihat antrean verifikasi.
- Menjalankan atau melihat hasil analisis AI.
- Memilih hasil deteksi yang valid.
- Melakukan finalisasi/verifikasi hasil.
- Melihat riwayat pemeriksaan.

### 4.4 Pasien

Pasien hanya melihat hasil pemeriksaan miliknya sendiri.

Kebutuhan pasien:

- Melihat daftar pemeriksaan.
- Melihat detail hasil deteksi.
- Melihat dokter yang memverifikasi.
- Melihat jumlah gigi susu yang terdeteksi.
- Download PDF hasil pemeriksaan.
- Verifikasi hasil melalui QR Code.

---

## 5. Scope Produk

### 5.1 In Scope

Fitur yang termasuk dalam versi utama:

- Authentication.
- Role-based access control.
- Dashboard berdasarkan role.
- Manajemen user.
- Manajemen pasien.
- Upload radiograph.
- Integrasi FastAPI AI detection.
- Preview hasil AI.
- Verifikasi dokter.
- Penyimpanan hasil deteksi final.
- Riwayat deteksi.
- Detail hasil pemeriksaan.
- Generate PDF.
- Generate QR Code.
- Public verification page.
- Profile management.

### 5.2 Out of Scope untuk Versi Awal

Fitur berikut tidak wajib di versi pertama:

- Multi-klinik.
- Appointment booking.
- Payment.
- Chat dokter-pasien.
- Notifikasi WhatsApp.
- Medical record lengkap.
- PACS/DICOM integration.
- Advanced AI model management.
- Audit log detail per klik.
- Mobile app native.

---

## 6. Tech Stack

```txt
Backend        : Laravel 13
Language       : PHP 8.3+
Frontend       : React + TypeScript
Bridge         : Inertia.js
Styling        : Tailwind CSS
Database       : MySQL / PostgreSQL
AI Service     : FastAPI Python API
PDF Generator  : DomPDF
QR Code        : SimpleSoftwareIO QR Code
Storage        : Laravel Storage
Auth           : Laravel Breeze / Laravel Starter Kit
Build Tool     : Vite
```

---

## 7. Prinsip Arsitektur

Website ini menggunakan pendekatan:

```txt
Role-aware, not role-separated.
```

Artinya, sistem tetap memiliki role, tetapi struktur folder frontend dan backend **tidak dipisahkan menjadi folder admin, dokter, radiografer, pasien secara kaku**.

Alasannya:

- Banyak halaman memiliki struktur yang mirip.
- Mengurangi duplikasi komponen.
- Memudahkan maintenance.
- Memudahkan pengembangan fitur baru.
- Controller dan service bisa reusable.
- UI bisa menyesuaikan permission, bukan membuat halaman terpisah total.

Contoh yang dihindari:

```txt
resources/js/Pages/Admin/Patients/Index.tsx
resources/js/Pages/Dokter/Patients/Index.tsx
resources/js/Pages/Radiografer/Patients/Index.tsx
```

Struktur yang disarankan:

```txt
resources/js/Pages/Patients/Index.tsx
```

Isi halaman disesuaikan berdasarkan permission user.

---

## 8. Struktur Folder Frontend

### 8.1 Prinsip Frontend

Frontend tidak dipisahkan per role. Struktur dibuat berdasarkan **fitur/domain**, bukan berdasarkan role.

Role hanya digunakan untuk:

- Menentukan menu yang muncul.
- Menentukan tombol yang boleh dilihat.
- Menentukan action yang boleh dilakukan.
- Menentukan data yang dikirim dari backend.
- Menentukan redirect dashboard awal.

### 8.2 Struktur Folder Frontend

```txt
resources/js/
├── app.tsx
├── bootstrap.ts
├── ssr.tsx
│
├── Components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   └── Pagination.tsx
│   │
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── PublicLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── MobileNav.tsx
│   │   └── PageHeader.tsx
│   │
│   ├── shared/
│   │   ├── EmptyState.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── RoleBadge.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ImagePreview.tsx
│   │   └── PermissionGate.tsx
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── ActivityCard.tsx
│   │   ├── DetectionChart.tsx
│   │   └── VerificationQueueCard.tsx
│   │
│   ├── patients/
│   │   ├── PatientForm.tsx
│   │   ├── PatientTable.tsx
│   │   ├── PatientDetailCard.tsx
│   │   └── PatientHistoryTable.tsx
│   │
│   ├── radiographs/
│   │   ├── RadiographUploadForm.tsx
│   │   ├── RadiographTable.tsx
│   │   ├── RadiographDetailCard.tsx
│   │   ├── DetectionResultTable.tsx
│   │   ├── DetectionImageViewer.tsx
│   │   └── VerificationChecklist.tsx
│   │
│   └── users/
│       ├── UserForm.tsx
│       ├── UserTable.tsx
│       └── UserRoleSelect.tsx
│
├── Pages/
│   ├── Welcome.tsx
│   │
│   ├── Auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
│   │
│   ├── Dashboard/
│   │   └── Index.tsx
│   │
│   ├── Patients/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   ├── Edit.tsx
│   │   ├── Show.tsx
│   │   └── History.tsx
│   │
│   ├── Users/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   ├── Edit.tsx
│   │   └── Show.tsx
│   │
│   ├── Radiographs/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   ├── Show.tsx
│   │   └── History.tsx
│   │
│   ├── Verification/
│   │   └── Tasks.tsx
│   │
│   ├── Reports/
│   │   └── Show.tsx
│   │
│   ├── Public/
│   │   └── VerifyResult.tsx
│   │
│   └── Profile/
│       ├── Edit.tsx
│       └── Partials/
│           ├── UpdateProfileInformationForm.tsx
│           ├── UpdatePasswordForm.tsx
│           └── DeleteUserForm.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePermission.ts
│   ├── useRole.ts
│   ├── useFlash.ts
│   └── useQueryParams.ts
│
├── types/
│   ├── auth.ts
│   ├── user.ts
│   ├── patient.ts
│   ├── radiograph.ts
│   ├── detection.ts
│   ├── dashboard.ts
│   └── pagination.ts
│
├── utils/
│   ├── permissions.ts
│   ├── formatDate.ts
│   ├── formatRole.ts
│   ├── formatStatus.ts
│   └── routeHelpers.ts
│
└── constants/
    ├── roles.ts
    ├── permissions.ts
    ├── radiographStatuses.ts
    └── fdiTeeth.ts
```

---

## 9. Strategi Frontend Role & Permission

### 9.1 Menu Sidebar Dinamis

Sidebar tidak dibuat per role, tetapi berdasarkan konfigurasi menu.

```ts
const navigationItems = [
  {
    label: 'Dashboard',
    href: route('dashboard'),
    roles: ['admin', 'dokter', 'radiografer', 'pasien'],
  },
  {
    label: 'Manajemen User',
    href: route('users.index'),
    roles: ['admin'],
  },
  {
    label: 'Pasien',
    href: route('patients.index'),
    roles: ['admin', 'dokter', 'radiografer'],
  },
  {
    label: 'Deteksi',
    href: route('radiographs.index'),
    roles: ['admin', 'dokter', 'radiografer'],
  },
  {
    label: 'Tugas Verifikasi',
    href: route('verification.tasks'),
    roles: ['dokter'],
  },
  {
    label: 'Hasil Pemeriksaan',
    href: route('radiographs.index'),
    roles: ['pasien'],
  },
];
```

### 9.2 PermissionGate Component

Komponen ini digunakan untuk menampilkan action berdasarkan permission.

```tsx
<PermissionGate permission="radiograph.create">
  <Button>Tambah Deteksi Baru</Button>
</PermissionGate>
```

### 9.3 Satu Halaman Bisa Digunakan Banyak Role

Contoh halaman:

```txt
Pages/Radiographs/Show.tsx
```

Bisa digunakan oleh:

- Admin
- Dokter
- Radiografer
- Pasien

Namun isi action-nya berbeda:

| Role | Akses |
|---|---|
| Admin | Lihat detail, analisis AI, finalize, hapus |
| Dokter | Lihat detail, analisis AI, finalize |
| Radiografer | Lihat detail, analisis AI |
| Pasien | Lihat detail, download PDF |

---

## 10. Struktur Folder Backend

### 10.1 Prinsip Backend

Backend juga tidak dipisah secara kaku per role. Struktur dibuat berdasarkan domain:

- User
- Patient
- Radiograph
- Detection
- Verification
- Report
- Dashboard
- Public Verification

Role dan permission ditangani melalui:

- Middleware
- Policy
- Gate
- Query scope
- Service-level authorization

### 10.2 Struktur Folder Backend

```txt
app/
├── Actions/
│   ├── Patients/
│   │   ├── CreatePatientAction.php
│   │   ├── UpdatePatientAction.php
│   │   └── DeletePatientAction.php
│   │
│   ├── Radiographs/
│   │   ├── CreateRadiographAction.php
│   │   ├── AnalyzeRadiographAction.php
│   │   ├── FinalizeRadiographAction.php
│   │   └── DeleteRadiographAction.php
│   │
│   └── Users/
│       ├── CreateUserAction.php
│       ├── UpdateUserAction.php
│       └── DeleteUserAction.php
│
├── Data/
│   ├── DashboardData.php
│   ├── PatientData.php
│   ├── RadiographData.php
│   └── DetectionData.php
│
├── Enums/
│   ├── UserRole.php
│   ├── Gender.php
│   └── RadiographStatus.php
│
├── Http/
│   ├── Controllers/
│   │   ├── DashboardController.php
│   │   ├── UserController.php
│   │   ├── PatientController.php
│   │   ├── RadiographController.php
│   │   ├── VerificationController.php
│   │   ├── ReportController.php
│   │   ├── PublicVerificationController.php
│   │   └── ProfileController.php
│   │
│   ├── Middleware/
│   │   ├── EnsureUserHasRole.php
│   │   └── RedirectUserByRole.php
│   │
│   ├── Requests/
│   │   ├── Users/
│   │   │   ├── StoreUserRequest.php
│   │   │   └── UpdateUserRequest.php
│   │   │
│   │   ├── Patients/
│   │   │   ├── StorePatientRequest.php
│   │   │   └── UpdatePatientRequest.php
│   │   │
│   │   └── Radiographs/
│   │       ├── StoreRadiographRequest.php
│   │       ├── AnalyzeRadiographRequest.php
│   │       └── FinalizeRadiographRequest.php
│   │
│   └── Resources/
│       ├── UserResource.php
│       ├── PatientResource.php
│       ├── RadiographResource.php
│       └── DetectionResource.php
│
├── Models/
│   ├── User.php
│   ├── Patient.php
│   ├── Radiograph.php
│   └── Detection.php
│
├── Policies/
│   ├── UserPolicy.php
│   ├── PatientPolicy.php
│   ├── RadiographPolicy.php
│   └── DetectionPolicy.php
│
├── Services/
│   ├── DashboardService.php
│   ├── UserService.php
│   ├── PatientService.php
│   ├── RadiographService.php
│   ├── AiDetectionService.php
│   ├── VerificationService.php
│   ├── ReportService.php
│   └── PublicVerificationService.php
│
├── Support/
│   ├── RadiographNumberGenerator.php
│   ├── PatientEmailGenerator.php
│   ├── FdiToothHelper.php
│   └── ImagePathResolver.php
│
└── ViewModels/
    ├── DashboardViewModel.php
    ├── PatientIndexViewModel.php
    ├── RadiographDetailViewModel.php
    └── VerificationTaskViewModel.php
```

---

## 11. Controller Design

Controller tidak dibuat seperti:

```txt
Admin/PatientController
Dokter/PatientController
Radiografer/PatientController
Pasien/PatientController
```

Melainkan cukup:

```txt
PatientController
RadiographController
DashboardController
VerificationController
ReportController
```

Role dibedakan melalui authorization.

Contoh:

```php
class RadiographController extends Controller
{
    public function index(Request $request, RadiographService $service)
    {
        $this->authorize('viewAny', Radiograph::class);

        return inertia('Radiographs/Index', [
            'radiographs' => $service->getVisibleRadiographsForUser($request->user()),
            'permissions' => $service->getPermissions($request->user()),
        ]);
    }

    public function show(Radiograph $radiograph, RadiographService $service)
    {
        $this->authorize('view', $radiograph);

        return inertia('Radiographs/Show', [
            'radiograph' => $service->getDetail($radiograph),
            'permissions' => $service->getDetailPermissions(auth()->user(), $radiograph),
        ]);
    }
}
```

---

## 12. Service Design

### 12.1 DashboardService

Bertugas mengembalikan data dashboard berdasarkan role.

```txt
DashboardService
├── getDashboardData(User $user)
├── getAdminDashboard()
├── getDoctorDashboard(User $user)
├── getRadiographerDashboard(User $user)
└── getPatientDashboard(User $user)
```

Frontend tetap menggunakan:

```txt
Pages/Dashboard/Index.tsx
```

Tetapi data dashboard berbeda berdasarkan role.

### 12.2 RadiographService

Bertanggung jawab untuk:

- List radiograph berdasarkan role.
- Detail radiograph.
- Upload gambar.
- Generate radiograph number.
- Update status.
- Delete radiograph.
- Filter history.

### 12.3 AiDetectionService

Bertanggung jawab untuk komunikasi dengan FastAPI API.

```txt
AiDetectionService
├── analyze(Radiograph $radiograph)
├── buildPayload(Radiograph $radiograph)
├── sendRequestToFastApi(array $payload)
└── normalizeResponse(array $response)
```

### 12.4 VerificationService

Bertanggung jawab untuk:

- Menampilkan antrean verifikasi.
- Menyimpan hasil final dokter.
- Menandai radiograph sebagai verified.
- Menyimpan dokter yang memverifikasi.
- Menghapus detection lama jika perlu.

### 12.5 ReportService

Bertanggung jawab untuk:

- Generate PDF.
- Generate QR Code.
- Menyusun data hasil pemeriksaan.
- Render view PDF.

---

## 13. Database Design

### 13.1 `users`

```txt
id
name
email
phone
role
password
email_verified_at
remember_token
created_at
updated_at
```

### 13.2 `patients`

```txt
nik
user_id
birth_place
birth_date
address
age
gender
created_at
updated_at
```

### 13.3 `radiographs`

```txt
id
radiograph_number
patient_nik
doctor_id
radiographer_id
image_path
result_image_path
status
ai_analyzed_at
verified_at
created_at
updated_at
```

Status:

```txt
waiting
analyzed
verified
failed
```

Rekomendasi status:

- `waiting`: baru upload, belum dianalisis.
- `analyzed`: AI sudah berjalan, menunggu verifikasi dokter.
- `verified`: sudah diverifikasi dokter.
- `failed`: proses AI gagal.

### 13.4 `detections`

```txt
id
radiograph_id
no_fdi
confidence
bbox_x
bbox_y
bbox_width
bbox_height
analysis
is_verified
created_at
updated_at
```

---

## 14. Role & Permission Matrix

### 14.1 Dashboard

| Fitur | Admin | Radiografer | Dokter | Pasien |
|---|---:|---:|---:|---:|
| Lihat dashboard | Ya | Ya | Ya | Ya |
| Lihat statistik global | Ya | Tidak | Tidak | Tidak |
| Lihat statistik pribadi | Ya | Ya | Ya | Ya |
| Lihat antrean verifikasi | Ya | Tidak | Ya | Tidak |

### 14.2 User Management

| Fitur | Admin | Radiografer | Dokter | Pasien |
|---|---:|---:|---:|---:|
| Lihat user | Ya | Tidak | Tidak | Tidak |
| Tambah user | Ya | Tidak | Tidak | Tidak |
| Edit user | Ya | Tidak | Tidak | Tidak |
| Hapus user | Ya | Tidak | Tidak | Tidak |

### 14.3 Patient Management

| Fitur | Admin | Radiografer | Dokter | Pasien |
|---|---:|---:|---:|---:|
| Lihat semua pasien | Ya | Ya | Ya | Tidak |
| Lihat data diri pasien | Tidak | Tidak | Tidak | Ya |
| Tambah pasien | Ya | Ya | Tidak | Tidak |
| Edit pasien | Ya | Ya | Tidak | Tidak |
| Hapus pasien | Ya | Tidak | Tidak | Tidak |
| Lihat riwayat pasien | Ya | Ya | Ya | Hanya milik sendiri |

### 14.4 Radiograph & Detection

| Fitur | Admin | Radiografer | Dokter | Pasien |
|---|---:|---:|---:|---:|
| Upload radiograph | Ya | Ya | Tidak | Tidak |
| Lihat semua radiograph | Ya | Ya | Ya | Tidak |
| Lihat radiograph sendiri | Tidak | Tidak | Tidak | Ya |
| Jalankan AI analysis | Ya | Ya | Ya | Tidak |
| Verifikasi hasil | Ya | Tidak | Ya | Tidak |
| Download PDF | Ya | Tidak | Ya | Ya |
| Hapus radiograph | Ya | Tidak | Tidak | Tidak |

---

## 15. Routing Design

Karena frontend dan backend tidak dipisah per role, route juga sebaiknya dibuat berdasarkan fitur.

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::resource('/users', UserController::class);

    Route::resource('/patients', PatientController::class);
    Route::get('/patients/{patient:nik}/history', [PatientController::class, 'history'])
        ->name('patients.history');

    Route::resource('/radiographs', RadiographController::class);
    Route::post('/radiographs/{radiograph}/analyze', [RadiographController::class, 'analyze'])
        ->name('radiographs.analyze');

    Route::post('/radiographs/{radiograph}/finalize', [RadiographController::class, 'finalize'])
        ->name('radiographs.finalize');

    Route::get('/verification/tasks', [VerificationController::class, 'tasks'])
        ->name('verification.tasks');

    Route::get('/reports/radiographs/{radiograph}/pdf', [ReportController::class, 'radiographPdf'])
        ->name('reports.radiographs.pdf');

    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');
});
```

Public route:

```php
Route::get('/', fn () => inertia('Welcome'))->name('welcome');

Route::get('/verify/{radiograph:radiograph_number}', [PublicVerificationController::class, 'show'])
    ->name('public.verify');
```

---

## 16. Core User Flow

### 16.1 Flow Login

```txt
User login
↓
Laravel cek credential
↓
Sistem membaca role user
↓
Redirect ke /dashboard
↓
DashboardController mengirim data sesuai role
```

### 16.2 Flow Upload Pemeriksaan

```txt
Admin/Radiografer membuka halaman Radiographs
↓
Klik Tambah Deteksi Baru
↓
Input data pasien + upload foto
↓
Laravel validasi data
↓
Jika pasien belum punya akun, sistem membuat akun pasien
↓
Simpan data patient
↓
Simpan image radiograph
↓
Buat radiograph status waiting
↓
Redirect ke detail radiograph
```

### 16.3 Flow AI Detection

```txt
User berwenang klik Analisis AI
↓
Laravel mengambil path image
↓
Laravel kirim request ke FastAPI API
↓
FastAPI memproses model YOLO/CNN
↓
FastAPI return hasil deteksi
↓
Laravel menyimpan hasil sementara / menampilkan hasil
↓
Status berubah menjadi analyzed
```

### 16.4 Flow Verifikasi Dokter

```txt
Dokter membuka Verification Tasks
↓
Pilih radiograph status analyzed / waiting
↓
Review hasil AI
↓
Centang gigi yang valid
↓
Klik Finalize
↓
Laravel simpan detection final
↓
Radiograph status menjadi verified
↓
doctor_id dan verified_at terisi
```

### 16.5 Flow Pasien Melihat Hasil

```txt
Pasien login
↓
Masuk dashboard
↓
Sistem hanya menampilkan radiograph miliknya
↓
Pasien klik detail
↓
Pasien melihat hasil verified
↓
Pasien download PDF
```

### 16.6 Flow QR Code Verification

```txt
User scan QR Code
↓
Browser membuka /verify/{radiograph_number}
↓
Sistem mencari radiograph
↓
Jika ditemukan, tampilkan status valid
↓
Jika tidak ditemukan, tampilkan data tidak valid
```

---

## 17. Functional Requirements

### FR-001 Authentication

Sistem harus menyediakan login, register opsional, logout, forgot password, dan profile management.

Acceptance criteria:

- User bisa login dengan email dan password.
- User diarahkan ke dashboard sesuai role.
- User tidak bisa mengakses halaman tanpa login.
- User bisa update profil.

### FR-002 Role-Based Access Control

Sistem harus membatasi akses berdasarkan role.

Acceptance criteria:

- Admin dapat mengakses semua fitur.
- Radiografer dapat upload radiograph.
- Dokter dapat melakukan verifikasi.
- Pasien hanya dapat melihat data miliknya sendiri.
- Akses tidak sah menghasilkan 403 atau redirect.

### FR-003 User Management

Admin dapat mengelola user dokter, radiografer, dan pasien.

Acceptance criteria:

- Admin bisa menambah user.
- Admin bisa mengedit user.
- Admin bisa menghapus user.
- Email harus unik.
- Password harus di-hash.

### FR-004 Patient Management

Admin dan radiografer dapat mengelola data pasien.

Acceptance criteria:

- NIK wajib 16 digit.
- Pasien memiliki relasi ke user.
- Jika email kosong, sistem dapat membuat email otomatis.
- Data pasien dapat dicari berdasarkan NIK/nama.

### FR-005 Radiograph Upload

Admin dan radiografer dapat mengunggah foto rontgen.

Acceptance criteria:

- File harus JPG, JPEG, atau PNG.
- Maksimal ukuran file 10MB.
- File disimpan di storage.
- Sistem membuat radiograph number unik.
- Status awal adalah `waiting`.

### FR-006 AI Detection

Sistem dapat mengirim gambar ke FastAPI API.

Acceptance criteria:

- Laravel mengirim `image_path` ke FastAPI API.
- Timeout minimal 120 detik.
- Sistem menangani response sukses dan gagal.
- Hasil AI ditampilkan di detail radiograph.
- Jika gagal, status menjadi `failed`.

### FR-007 Doctor Verification

Dokter dapat memverifikasi hasil deteksi AI.

Acceptance criteria:

- Dokter dapat memilih gigi valid.
- Sistem menyimpan data detection final.
- Sistem mengisi doctor_id.
- Sistem mengisi verified_at.
- Status berubah menjadi `verified`.

### FR-008 Patient Result

Pasien dapat melihat hasil pemeriksaan miliknya.

Acceptance criteria:

- Pasien hanya melihat radiograph yang terkait dengan NIK/user miliknya.
- Pasien dapat melihat detail pemeriksaan.
- Pasien dapat melihat jumlah gigi susu terdeteksi.
- Pasien dapat melihat dokter verifikator.

### FR-009 PDF Report

Sistem dapat membuat laporan PDF.

Acceptance criteria:

- PDF berisi data pasien.
- PDF berisi data radiograph.
- PDF berisi daftar gigi terdeteksi.
- PDF berisi dokter yang memverifikasi.
- PDF berisi QR Code.

### FR-010 Public Verification

Sistem menyediakan halaman publik untuk verifikasi hasil.

Acceptance criteria:

- Halaman bisa diakses tanpa login.
- Jika radiograph valid, tampilkan data ringkas.
- Jika tidak valid, tampilkan pesan tidak ditemukan.
- Tidak menampilkan data sensitif berlebihan.

---

## 18. Non-Functional Requirements

### 18.1 Security

- Password menggunakan hashing Laravel.
- Form menggunakan CSRF protection.
- Upload file divalidasi.
- Akses data pasien dibatasi.
- Public verification tidak boleh menampilkan data terlalu detail.
- Role dan permission dicek di backend, bukan hanya frontend.

### 18.2 Performance

- Dashboard menggunakan query yang efisien.
- List data menggunakan pagination.
- Gambar radiograph tidak langsung dimuat full resolution jika tidak perlu.
- AI process memiliki timeout dan error handling.
- Riwayat deteksi difilter dengan pagination.

### 18.3 Maintainability

- Controller tipis.
- Business logic masuk ke Service/Action.
- Frontend reusable component.
- Halaman tidak dipisah per role.
- Policy digunakan untuk authorization.
- Enum digunakan untuk role dan status.

### 18.4 Scalability

- AI service dipisah dari Laravel.
- Storage bisa diganti ke S3-compatible storage di masa depan.
- Queue bisa digunakan untuk AI processing jika proses makin berat.
- Struktur role-aware memungkinkan penambahan role baru.

---

## 19. UI/UX Requirements

### 19.1 Design Direction

Tampilan website harus:

- Bersih.
- Profesional.
- Medical/healthcare style.
- Modern.
- Mudah dibaca.
- Tidak terlalu ramai.
- Responsif untuk desktop dan tablet.

### 19.2 Warna yang Disarankan

```txt
Primary       : #2563EB
Secondary     : #0F766E
Background    : #F8FAFC
Surface       : #FFFFFF
Text Main     : #0F172A
Text Muted    : #64748B
Border        : #E2E8F0
Success       : #16A34A
Warning       : #F59E0B
Danger        : #DC2626
```

### 19.3 Layout Utama

Gunakan satu layout utama:

```txt
AppLayout
├── Sidebar
├── Topbar/Navbar
├── PageHeader
└── Content
```

Sidebar berubah berdasarkan role.

---

## 20. Page List

### Public

```txt
/
/login
/register
/verify/{radiograph_number}
```

### Authenticated

```txt
/dashboard
/profile
/users
/users/create
/users/{id}/edit
/patients
/patients/create
/patients/{nik}
/patients/{nik}/edit
/patients/{nik}/history
/radiographs
/radiographs/create
/radiographs/{id}
/radiographs/{id}/history
/verification/tasks
/reports/radiographs/{id}/pdf
```

---

## 21. Dashboard Behavior

Karena hanya ada satu halaman:

```txt
Pages/Dashboard/Index.tsx
```

Maka backend mengirim data berbeda berdasarkan role.

### 21.1 Admin Dashboard

Menampilkan:

- Total pasien.
- Total dokter.
- Total radiografer.
- Total deteksi.
- Deteksi minggu ini.
- Deteksi bulan ini.
- Grafik deteksi.
- Aktivitas terbaru.

### 21.2 Radiografer Dashboard

Menampilkan:

- Total pasien yang pernah diinput.
- Total upload radiograph.
- Deteksi hari ini.
- Deteksi selesai.
- Pasien terbaru.

### 21.3 Dokter Dashboard

Menampilkan:

- Total verifikasi.
- Deteksi perlu verifikasi.
- Deteksi selesai.
- Antrean verifikasi.
- Pemeriksaan terbaru.

### 21.4 Pasien Dashboard

Menampilkan:

- Total pemeriksaan.
- Pemeriksaan terbaru.
- Status hasil.
- Tombol lihat detail/download PDF.

---

## 22. Data Access Rules

### 22.1 Admin

Admin dapat melihat semua data.

### 22.2 Radiografer

Radiografer dapat melihat:

- Data pasien.
- Radiograph yang dia upload.
- Riwayat pemeriksaan.
- Detail hasil deteksi.

Radiografer tidak dapat melakukan final verification kecuali diberikan permission khusus.

### 22.3 Dokter

Dokter dapat melihat:

- Pasien.
- Radiograph yang menunggu verifikasi.
- Radiograph yang pernah dia verifikasi.
- Detail hasil deteksi.

Dokter dapat melakukan finalize.

### 22.4 Pasien

Pasien hanya dapat melihat:

- Data dirinya sendiri.
- Radiograph miliknya sendiri.
- Hasil pemeriksaan miliknya sendiri.

---

## 23. Recommended Permission List

```txt
dashboard.view

users.view
users.create
users.update
users.delete

patients.view
patients.create
patients.update
patients.delete
patients.history.view

radiographs.view
radiographs.create
radiographs.update
radiographs.delete
radiographs.analyze
radiographs.finalize

verification.tasks.view

reports.download

public.verify.view
```

Permission ini tidak harus disimpan di database untuk versi awal. Bisa dibuat hardcoded melalui Policy/Gate.

---

## 24. AI API Contract

### 24.1 Endpoint

```txt
POST /predict
```

### 24.2 Request dari Laravel ke FastAPI

```json
{
  "image_path": "/absolute/path/to/storage/app/public/radiographs/example.jpg"
}
```

### 24.3 Response sukses

```json
{
  "results": [
    {
      "fdi": 51,
      "confidence": 0.95,
      "bbox": [120, 80, 45, 60]
    },
    {
      "fdi": 52,
      "confidence": 0.89,
      "bbox": [180, 85, 42, 58]
    }
  ],
  "result_image": "result_example.jpg"
}
```

### 24.4 Response gagal

```json
{
  "message": "Detection failed",
  "error": "Model cannot process image"
}
```

---

## 25. Development Milestones

### Phase 1 — Foundation

- Setup Laravel 13.
- Setup React + TypeScript + Inertia.
- Setup Tailwind CSS.
- Setup authentication.
- Setup role enum.
- Setup base layout.
- Setup sidebar dynamic by role.

### Phase 2 — Database & Core Models

- Migration users.
- Migration patients.
- Migration radiographs.
- Migration detections.
- Model relationship.
- Seeder admin.
- Factory dummy data.

### Phase 3 — User & Patient Management

- User CRUD.
- Patient CRUD.
- Patient history.
- Role-based access.

### Phase 4 — Radiograph Upload

- Radiograph index.
- Radiograph create.
- Upload image.
- Store file.
- Detail radiograph.
- Status tracking.

### Phase 5 — AI Integration

- AiDetectionService.
- Analyze radiograph.
- Display AI result.
- Handle failed AI request.
- Save result image path.

### Phase 6 — Doctor Verification

- Verification task page.
- Verification checklist.
- Finalize result.
- Store detections.
- Update status verified.

### Phase 7 — Patient Result & PDF

- Patient dashboard.
- Patient detail result.
- PDF generation.
- QR Code generation.

### Phase 8 — Public Verification

- Public verify route.
- Valid result page.
- Invalid result page.
- QR Code link integration.

### Phase 9 — Polish & Testing

- UI refinement.
- Authorization testing.
- Upload testing.
- AI error testing.
- PDF testing.
- Role access testing.

---

## 26. Success Metrics

Website dianggap berhasil jika:

1. Radiografer dapat input pasien dan upload foto rontgen.
2. Laravel dapat mengirim gambar ke FastAPI API.
3. Hasil AI dapat ditampilkan.
4. Dokter dapat memilih hasil valid dan finalize.
5. Pasien dapat melihat hasil miliknya sendiri.
6. PDF berhasil dibuat dengan QR Code.
7. QR Code dapat membuka halaman verifikasi publik.
8. Setiap role hanya dapat mengakses fitur yang sesuai.
9. Struktur frontend dan backend tetap rapi tanpa duplikasi per role.

---

## 27. Kesimpulan Arsitektur

Untuk website ini, pendekatan terbaik adalah:

```txt
Frontend by feature, not by role.
Backend by domain, not by role.
Authorization by policy, middleware, and permission.
UI behavior by role-aware components.
```

Struktur akhirnya akan lebih bersih seperti ini:

```txt
Frontend:
Pages/Patients
Pages/Radiographs
Pages/Dashboard
Pages/Verification
Pages/Users

Backend:
PatientController
RadiographController
DashboardController
VerificationController
UserController

Services:
PatientService
RadiographService
AiDetectionService
VerificationService
DashboardService
ReportService
```

Dengan pendekatan ini, sistem tetap mendukung semua role, tetapi tidak membuat folder dan logic berulang-ulang untuk admin, dokter, radiografer, dan pasien.
