# PRD Fitur Chatbot RAG Dentalyze AI / DentographAI

Gunakan langchain, database menggunakan mysql + vector, model embedding gunakan bge-m3:567m dengan port 11435 karena menggunakan tunneling ollama. Model LLM gunaka gemini untuk API lalu sediakan juga opsi menggunakan llm lokal yang mana akan mengikuti dari model yang tersedia di ollama yaitu llama3.1:8b-instruct-q8_0. Pastikan perubahan penggunaan LLM mudah di config python, jangan meng HARDCODE nama model.

## 1. Ringkasan Fitur

Fitur **Chatbot RAG Dentalyze AI** adalah fitur chatbot untuk pasien yang dapat menjelaskan hasil radiologi gigi berdasarkan:

1. **Hasil radiograf pasien** dari tabel `radiographs`.
2. **Hasil deteksi gigi** dari tabel `detections`.
3. **Knowledge base internal** yang dibuat oleh admin melalui tabel `ai_knowledge_bases`.

Chatbot tidak mengambil jawaban dari internet. Jawaban harus berdasarkan konten yang sudah disediakan admin dan hasil radiologi pasien yang tersedia di sistem.

Contoh kasus:

> Pasien bertanya: “Gigi nomor 38 saya kenapa kok impaksi?”  
> Sistem mencari detection gigi nomor 38 pada radiograf pasien. Jika abnormality = `Impaksi`, sistem mengambil knowledge aktif dengan `condition_name = Impaksi`, lalu chatbot menjawab berdasarkan data detection dan konten knowledge tersebut.

---

## 2. Tujuan Fitur

### 2.1 Tujuan Utama

Membantu pasien memahami hasil radiologi giginya dengan bahasa yang lebih mudah dipahami, tanpa menggantikan peran dokter.

### 2.2 Tujuan Produk

1. Pasien dapat bertanya mengenai hasil radiografinya.
2. Pasien dapat memahami arti kondisi seperti `Impaksi`, `Karies`, `LesiPeriapikal`, `Resorpsi`, dan `Normal`.
3. Admin dapat membuat knowledge base sederhana berupa teks.
4. Sistem dapat melakukan embedding terhadap knowledge base.
5. Chatbot menjawab berdasarkan knowledge internal, bukan internet.
6. Setiap jawaban chatbot dapat dilacak sumbernya melalui `ai_chat_message_sources`.

---

## 3. Scope Fitur

### 3.1 In Scope

Fitur yang termasuk dalam pengembangan:

1. Admin membuat knowledge base.
2. Admin mengedit knowledge base.
3. Admin mengaktifkan/nonaktifkan knowledge base.
4. Sistem membuat embedding dari konten knowledge.
5. Pasien membuat sesi chat.
6. Pasien mengirim pertanyaan.
7. Sistem menyimpan pesan user dan assistant.
8. Sistem mencari radiograf/detection yang relevan.
9. Sistem mencari knowledge base yang relevan.
10. Sistem membuat jawaban berdasarkan hasil radiologi dan knowledge.
11. Sistem menyimpan sumber jawaban ke `ai_chat_message_sources`.
12. Pasien melihat histori percakapan.

### 3.2 Out of Scope

Tidak termasuk dalam tahap MVP:

1. Upload knowledge dari PDF.
2. Upload knowledge dari HTML.
3. Upload dokumen medis kompleks.
4. Chunking dokumen panjang.
5. Approval knowledge oleh dokter.
6. Feedback jawaban chatbot.
7. Perbandingan otomatis multi-radiograf yang kompleks.
8. Voice chatbot.
9. Chatbot untuk dokter/admin.
10. Chatbot yang browsing internet.

---

## 4. User Role

### 4.1 Admin

Admin dapat:

1. Membuat knowledge base.
2. Mengedit knowledge base.
3. Menghapus atau menonaktifkan knowledge base.
4. Mengubah status knowledge menjadi `draft`, `active`, atau `inactive`.
5. Melihat daftar knowledge base.
6. Melihat detail knowledge base.
7. Menjalankan proses generate embedding.

### 4.2 Pasien

Pasien dapat:

1. Membuka fitur Chat Dentalyze AI.
2. Membuat sesi chat.
3. Bertanya tentang hasil radiografinya.
4. Melihat jawaban chatbot.
5. Melihat histori chat sebelumnya.

---

## 5. Database Final

Database yang digunakan untuk fitur chatbot RAG:

```php
Schema::create('ai_chat_sessions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('title')->default('Chat Dentalyze AI');
    $table->timestamps();
});

Schema::create('ai_chat_messages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('ai_chat_session_id')->constrained()->cascadeOnDelete();
    $table->string('role');
    $table->longText('content');
    $table->json('metadata')->nullable();
    $table->timestamps();
});

Schema::create('ai_knowledge_bases', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('category')->default('disease');
    $table->string('condition_name')->nullable();
    $table->longText('content');
    $table->vector('embedding', dimensions: 1024)->nullable();
    $table->string('embedding_model')->nullable();
    $table->enum('status', ['draft', 'active', 'inactive'])->default('draft');
    $table->timestamps();
    $table->index(['condition_name', 'status']);
    $table->index(['category', 'status']);
});

Schema::create('ai_chat_message_sources', function (Blueprint $table) {
    $table->id();

    $table->foreignId('ai_chat_message_id')
        ->constrained('ai_chat_messages')
        ->cascadeOnDelete();

    $table->foreignId('ai_knowledge_base_id')
        ->nullable()
        ->constrained('ai_knowledge_bases')
        ->nullOnDelete();

    $table->string('id_radiograph')->nullable();

    $table->unsignedBigInteger('detection_id')->nullable();

    $table->string('source_label')->nullable();
    $table->decimal('relevance_score', 8, 6)->nullable();

    $table->timestamps();

    $table->foreign('id_radiograph')
        ->references('id_radiograph')
        ->on('radiographs')
        ->nullOnDelete();

    $table->foreign('detection_id')
        ->references('id_detection')
        ->on('detections')
        ->nullOnDelete();

    $table->index('ai_chat_message_id');
    $table->index('ai_knowledge_base_id');
    $table->index('id_radiograph');
    $table->index('detection_id');
});
```

---

## 6. Penjelasan Tabel

### 6.1 `ai_chat_sessions`

Menyimpan sesi percakapan chatbot.

| Field | Fungsi |
|---|---|
| `id` | ID sesi chat |
| `user_id` | User pasien pemilik sesi chat |
| `title` | Judul sesi chat |
| `created_at` | Waktu sesi dibuat |
| `updated_at` | Waktu sesi diperbarui |

Satu pasien bisa memiliki banyak sesi chat.

Contoh:

```text
Session 1: Chat Dentalyze AI
Session 2: Tanya Hasil Radiografi Mei 2026
```

---

### 6.2 `ai_chat_messages`

Menyimpan pesan dalam sesi chat.

| Field | Fungsi |
|---|---|
| `id` | ID pesan |
| `ai_chat_session_id` | Relasi ke session |
| `role` | Role pengirim pesan |
| `content` | Isi pesan |
| `metadata` | Data tambahan |
| `created_at` | Waktu pesan dibuat |

Nilai `role` yang digunakan:

```text
user
assistant
system
```

Contoh metadata user message:

```json
{
  "intent": "ask_tooth_condition",
  "detected_tooth_number": "38",
  "detected_condition": "Impaksi"
}
```

Contoh metadata assistant message:

```json
{
  "used_radiograph": true,
  "used_detection": true,
  "used_knowledge": true,
  "answer_type": "radiology_explanation"
}
```

---

### 6.3 `ai_knowledge_bases`

Menyimpan knowledge base yang dibuat admin.

| Field | Fungsi |
|---|---|
| `title` | Judul knowledge |
| `category` | Kategori knowledge |
| `condition_name` | Nama kondisi/penyakit |
| `content` | Isi knowledge dari admin |
| `embedding` | Vector embedding dari konten |
| `embedding_model` | Nama model embedding |
| `status` | Status knowledge |

Contoh data:

```text
title: Penjelasan Impaksi Gigi
category: disease
condition_name: Impaksi
content: Impaksi gigi adalah kondisi ketika gigi tidak dapat tumbuh keluar secara normal...
embedding_model: bge-m3
status: active
```

---

### 6.4 `ai_chat_message_sources`

Menyimpan sumber jawaban chatbot.

Tabel ini penting untuk audit. Setiap jawaban assistant dapat dilacak berasal dari:

1. Knowledge base apa.
2. Radiograf mana.
3. Detection mana.

| Field | Fungsi |
|---|---|
| `ai_chat_message_id` | Pesan assistant yang menggunakan source |
| `ai_knowledge_base_id` | Knowledge yang digunakan |
| `id_radiograph` | Radiograf yang digunakan |
| `detection_id` | Detection yang digunakan |
| `source_label` | Label sumber |
| `relevance_score` | Skor relevansi retrieval |

Contoh data:

```text
ai_chat_message_id: 15
ai_knowledge_base_id: 2
id_radiograph: RAD-20260524-ABCD
detection_id: 8
source_label: Detection gigi 38 + Knowledge Impaksi
relevance_score: 0.873211
```

---

## 7. User Flow Admin Create Knowledge

### 7.1 Flow Utama

```text
Admin login
↓
Admin buka menu AI Knowledge Base
↓
Admin klik Create Knowledge
↓
Admin mengisi form
↓
Admin submit
↓
Sistem menyimpan knowledge dengan status draft/active
↓
Sistem generate embedding dari title + content
↓
Embedding disimpan ke ai_knowledge_bases.embedding
↓
Knowledge siap digunakan chatbot jika status = active
```

### 7.2 Form Create Knowledge

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `title` | text | Ya | Judul knowledge |
| `category` | select/text | Ya | Default `disease` |
| `condition_name` | text/select | Tidak | Contoh: Impaksi, Karies |
| `content` | textarea | Ya | Isi penjelasan dari admin |
| `status` | select | Ya | draft, active, inactive |

### 7.3 Pilihan Category

Untuk MVP:

```text
disease
radiology_guide
faq
general
```

| Category | Fungsi |
|---|---|
| `disease` | Penjelasan penyakit/kondisi gigi |
| `radiology_guide` | Panduan membaca hasil radiologi |
| `faq` | Pertanyaan umum pasien |
| `general` | Pengetahuan umum lain |

### 7.4 Pilihan Condition Name

Untuk kategori `disease`, condition bisa mengikuti abnormality pada tabel `detections`.

Contoh:

```text
Normal
Impaksi
Karies
LesiPeriapikal
Resorpsi
```

Penting: `condition_name` sebaiknya konsisten dengan nilai `detections.abnormality`.

Jika detection menyimpan:

```text
Impaksi
```

Maka knowledge juga harus menyimpan:

```text
condition_name = Impaksi
```

Jangan campur format seperti:

```text
impaksi
Impaksi Gigi
tooth_impaction
```

Agar retrieval lebih mudah.

---

## 8. Validasi Admin Knowledge

### 8.1 Create Knowledge Validation

```text
title:
- required
- string
- max:255

category:
- required
- string
- max:100

condition_name:
- nullable
- string
- max:100

content:
- required
- string
- min:50

status:
- required
- in:draft,active,inactive
```

### 8.2 Update Knowledge Validation

Sama seperti create.

Jika `content` berubah, sistem harus generate ulang embedding.

### 8.3 Status Rule

| Status | Bisa digunakan chatbot? | Keterangan |
|---|---:|---|
| `draft` | Tidak | Masih disusun admin |
| `active` | Ya | Bisa digunakan chatbot |
| `inactive` | Tidak | Dinonaktifkan |

---

## 9. User Flow Pasien Chatbot

### 9.1 Flow Utama Pasien

```text
Pasien login
↓
Pasien buka Chat Dentalyze AI
↓
Sistem membuka/membuat ai_chat_session
↓
Pasien mengirim pertanyaan
↓
Sistem menyimpan pesan user
↓
Sistem memproses pertanyaan
↓
Sistem mencari radiograf/detection relevan
↓
Sistem mencari knowledge relevan
↓
Sistem membuat prompt RAG
↓
LLM membuat jawaban
↓
Sistem menyimpan jawaban assistant
↓
Sistem menyimpan source jawaban
↓
Pasien melihat jawaban
```

### 9.2 Contoh Pertanyaan Pasien

```text
Gigi nomor 38 saya kenapa impaksi?
Apa itu karies?
Kenapa di hasil saya ada lesi periapikal?
Gigi yang ditandai merah itu maksudnya apa?
Apakah impaksi itu berbahaya?
```

---

## 10. Logic Chatbot RAG

### 10.1 Step 1 — Simpan Pesan User

Ketika pasien mengirim pertanyaan:

```text
Gigi nomor 38 saya kenapa impaksi?
```

Sistem membuat record:

```text
ai_chat_messages.role = user
ai_chat_messages.content = "Gigi nomor 38 saya kenapa impaksi?"
```

---

### 10.2 Step 2 — Deteksi Intent dan Entity

Sistem mencoba mendeteksi:

| Entity | Contoh |
|---|---|
| Tooth number | 38 |
| Condition | Impaksi |
| Intent | ask_tooth_condition |

Contoh metadata:

```json
{
  "intent": "ask_tooth_condition",
  "detected_tooth_number": "38",
  "detected_condition": "Impaksi"
}
```

---

### 10.3 Step 3 — Cari Detection Relevan

Jika user menyebut nomor gigi, sistem mencari ke tabel `detections`:

```text
detections.no_fdi = 38
detections.is_active = true
```

Tetapi sistem harus memastikan detection tersebut milik radiograf pasien yang benar.

Data radiograf hanya boleh diakses jika:

```text
radiographs.patient_nik = pasien.nik
```

Sistem tidak boleh mengambil detection milik pasien lain.

---

### 10.4 Step 4 — Tentukan Condition

Jika detection ditemukan:

```text
no_fdi = 38
abnormality = Impaksi
analysis = ...
confidence = 0.9123
```

Maka condition untuk retrieval:

```text
condition_name = Impaksi
```

Jika pasien menyebut condition langsung, misalnya:

```text
Apa itu impaksi?
```

Sistem dapat menggunakan:

```text
condition_name = Impaksi
```

---

### 10.5 Step 5 — Cari Knowledge

Knowledge yang boleh dipakai:

```text
ai_knowledge_bases.status = active
```

Strategi pencarian MVP:

#### Prioritas 1 — Berdasarkan condition

```php
AiKnowledgeBase::query()
    ->where('condition_name', $conditionName)
    ->where('status', 'active')
    ->get();
```

#### Prioritas 2 — Berdasarkan embedding similarity

Jika ada banyak knowledge aktif, sistem membandingkan embedding pertanyaan dengan `embedding`.

#### Prioritas 3 — Berdasarkan category

Untuk pertanyaan umum:

```text
category = faq
category = radiology_guide
category = general
```

---

### 10.6 Step 6 — Build Prompt RAG

Prompt harus berisi:

1. Pertanyaan pasien.
2. Detection context.
3. Radiograph context.
4. Knowledge context.
5. Aturan keamanan.

Contoh prompt internal:

```text
Anda adalah Chatbot Dentalyze AI untuk membantu pasien memahami hasil radiologi gigi.

Aturan:
- Jawab hanya berdasarkan hasil radiologi pasien dan knowledge base yang diberikan.
- Jangan mengambil informasi dari internet.
- Jangan membuat diagnosis baru.
- Jangan menyebut kondisi yang tidak ada di hasil pasien.
- Jangan memberikan resep obat.
- Jika pertanyaan membutuhkan keputusan medis, sarankan konsultasi dengan dokter gigi.
- Gunakan bahasa Indonesia yang sederhana.

Pertanyaan pasien:
{question}

Konteks hasil radiologi pasien:
{detection_context}

Knowledge base:
{knowledge_context}

Jawab dengan format:
1. Penjelasan singkat
2. Hubungan dengan hasil pasien
3. Saran umum
4. Disclaimer
```

---

### 10.7 Step 7 — Generate Jawaban

Contoh jawaban:

```text
Berdasarkan hasil radiologi Anda, gigi nomor 38 terdeteksi mengalami impaksi. Impaksi berarti gigi tidak tumbuh keluar secara normal karena terhalang oleh gigi lain, tulang, atau jaringan gusi.

Pada hasil Anda, kondisi ini tercatat pada gigi nomor 38. Penjelasan ini berdasarkan hasil radiologi yang tersedia di sistem dan knowledge Dentalyze AI.

Untuk memastikan tindakan yang paling sesuai, silakan konsultasikan dengan dokter gigi. Jawaban ini bersifat edukasi dan tidak menggantikan pemeriksaan dokter.
```

---

### 10.8 Step 8 — Simpan Jawaban Assistant

Sistem menyimpan:

```text
ai_chat_messages.role = assistant
ai_chat_messages.content = jawaban chatbot
```

Metadata:

```json
{
  "used_detection": true,
  "used_knowledge": true,
  "condition_name": "Impaksi",
  "tooth_number": "38"
}
```

---

### 10.9 Step 9 — Simpan Source

Sistem menyimpan ke `ai_chat_message_sources`:

```text
ai_chat_message_id = ID pesan assistant
ai_knowledge_base_id = ID knowledge Impaksi
id_radiograph = ID radiograf yang digunakan
detection_id = ID detection gigi 38
source_label = Detection gigi 38 + Knowledge Impaksi
relevance_score = nilai similarity jika ada
```

---

## 11. Functional Requirements

### 11.1 Admin Knowledge Management

#### FR-ADM-001 — Admin dapat melihat daftar knowledge

Admin dapat melihat table knowledge dengan kolom:

1. Title
2. Category
3. Condition Name
4. Status
5. Updated At
6. Action

Action:

1. Detail
2. Edit
3. Activate
4. Deactivate
5. Delete atau Archive

#### FR-ADM-002 — Admin dapat membuat knowledge

Admin dapat membuat knowledge baru dengan field:

1. Title
2. Category
3. Condition Name
4. Content
5. Status

Setelah knowledge dibuat, sistem membuat embedding.

#### FR-ADM-003 — Admin dapat mengedit knowledge

Admin dapat mengedit:

1. Title
2. Category
3. Condition Name
4. Content
5. Status

Jika `content` berubah, sistem generate ulang embedding.

#### FR-ADM-004 — Admin dapat mengubah status knowledge

Admin dapat mengubah status:

```text
draft → active
active → inactive
inactive → active
```

Chatbot hanya boleh menggunakan knowledge dengan status `active`.

#### FR-ADM-005 — Sistem menampilkan status embedding

Pada halaman detail knowledge, sistem menampilkan:

```text
Embedding generated / belum generated
Embedding model
Updated at
```

---

### 11.2 Patient Chat

#### FR-PAT-001 — Pasien dapat membuka halaman Chat Dentalyze AI

Pasien dapat membuka halaman chat dari dashboard atau detail radiograf.

#### FR-PAT-002 — Sistem membuat chat session

Jika pasien belum punya session aktif, sistem membuat `ai_chat_sessions`.

#### FR-PAT-003 — Pasien dapat mengirim pertanyaan

Pasien dapat mengetik pertanyaan ke chatbot.

#### FR-PAT-004 — Sistem menyimpan pesan user

Setiap pertanyaan pasien disimpan ke `ai_chat_messages`.

#### FR-PAT-005 — Sistem mencari hasil radiologi relevan

Sistem mengambil data dari:

```text
radiographs
detections
```

Dengan aturan:

```text
radiograph harus milik pasien login
detection harus is_active = true
```

#### FR-PAT-006 — Sistem mencari knowledge relevan

Sistem mengambil knowledge dari:

```text
ai_knowledge_bases
```

Dengan aturan:

```text
status = active
```

#### FR-PAT-007 — Sistem menghasilkan jawaban chatbot

Jawaban dibuat berdasarkan:

1. Pertanyaan pasien.
2. Detection pasien.
3. Knowledge aktif.
4. Prompt safety.

#### FR-PAT-008 — Sistem menyimpan jawaban assistant

Jawaban chatbot disimpan ke `ai_chat_messages`.

#### FR-PAT-009 — Sistem menyimpan source jawaban

Sumber jawaban disimpan ke `ai_chat_message_sources`.

#### FR-PAT-010 — Pasien dapat melihat histori chat

Pasien dapat melihat percakapan sebelumnya.

---

## 12. Non-Functional Requirements

### 12.1 Security

1. Pasien hanya boleh melihat chat miliknya sendiri.
2. Pasien hanya boleh bertanya berdasarkan radiograf miliknya sendiri.
3. Chatbot tidak boleh mengambil data pasien lain.
4. Admin knowledge hanya bisa diakses role admin.
5. Semua endpoint chat harus memakai auth middleware.

### 12.2 Privacy

Jangan kirim data sensitif yang tidak perlu ke LLM.

Hindari mengirim:

```text
NIK lengkap
alamat pasien
nomor telepon
email
```

Cukup kirim:

```text
nomor gigi
abnormality
analysis
confidence
tanggal radiograf jika perlu
```

### 12.3 Safety

Chatbot harus selalu mengikuti aturan:

1. Tidak membuat diagnosis baru.
2. Tidak memberikan resep obat.
3. Tidak menyarankan tindakan medis pasti.
4. Tidak menjawab di luar knowledge base.
5. Selalu memberi disclaimer bahwa jawaban bersifat edukasi.
6. Jika informasi tidak cukup, jawab bahwa data tidak cukup.

### 12.4 Performance

| Proses | Target |
|---|---:|
| Load chat history | < 1 detik |
| Simpan pesan user | < 500 ms |
| Retrieval knowledge | < 2 detik |
| Generate jawaban | < 15 detik |
| Total response chatbot | < 20 detik |

---

## 13. Authorization Rules

### 13.1 Admin

Admin dapat mengakses:

```text
GET /admin/ai-knowledge-bases
POST /admin/ai-knowledge-bases
GET /admin/ai-knowledge-bases/{id}
PUT /admin/ai-knowledge-bases/{id}
DELETE /admin/ai-knowledge-bases/{id}
```

### 13.2 Pasien

Pasien dapat mengakses:

```text
GET /ai-chat
POST /ai-chat/sessions
GET /ai-chat/sessions/{session}
POST /ai-chat/sessions/{session}/messages
```

Dengan syarat:

```text
session.user_id = auth()->id()
```

---

## 14. Route Recommendation

### 14.1 Admin Routes

```php
Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/ai-knowledge-bases', [AiKnowledgeBaseController::class, 'index'])
        ->name('admin.ai-knowledge-bases.index');

    Route::get('/ai-knowledge-bases/create', [AiKnowledgeBaseController::class, 'create'])
        ->name('admin.ai-knowledge-bases.create');

    Route::post('/ai-knowledge-bases', [AiKnowledgeBaseController::class, 'store'])
        ->name('admin.ai-knowledge-bases.store');

    Route::get('/ai-knowledge-bases/{knowledge}', [AiKnowledgeBaseController::class, 'show'])
        ->name('admin.ai-knowledge-bases.show');

    Route::get('/ai-knowledge-bases/{knowledge}/edit', [AiKnowledgeBaseController::class, 'edit'])
        ->name('admin.ai-knowledge-bases.edit');

    Route::put('/ai-knowledge-bases/{knowledge}', [AiKnowledgeBaseController::class, 'update'])
        ->name('admin.ai-knowledge-bases.update');

    Route::delete('/ai-knowledge-bases/{knowledge}', [AiKnowledgeBaseController::class, 'destroy'])
        ->name('admin.ai-knowledge-bases.destroy');
});
```

### 14.2 Patient Chat Routes

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/ai-chat', [AiChatController::class, 'index'])
        ->name('ai-chat.index');

    Route::post('/ai-chat/sessions', [AiChatController::class, 'storeSession'])
        ->name('ai-chat.sessions.store');

    Route::get('/ai-chat/sessions/{session}', [AiChatController::class, 'showSession'])
        ->name('ai-chat.sessions.show');

    Route::post('/ai-chat/sessions/{session}/messages', [AiChatController::class, 'sendMessage'])
        ->name('ai-chat.messages.store');
});
```

---

## 15. Backend Service Recommendation

Gunakan service agar controller tetap bersih.

```text
app/Services/AiKnowledgeBaseService.php
app/Services/AiChatService.php
app/Services/AiEmbeddingService.php
app/Services/AiRetrievalService.php
app/Services/AiPromptBuilderService.php
```

### 15.1 `AiKnowledgeBaseService`

Tugas:

1. Create knowledge.
2. Update knowledge.
3. Generate embedding.
4. Activate/deactivate knowledge.

### 15.2 `AiEmbeddingService`

Tugas:

1. Mengirim text ke embedding model.
2. Menghasilkan vector 1024 dimensi.
3. Menyimpan vector ke `ai_knowledge_bases.embedding`.

### 15.3 `AiChatService`

Tugas:

1. Membuat session.
2. Menyimpan pesan user.
3. Memproses pertanyaan.
4. Menyimpan jawaban assistant.
5. Menyimpan source jawaban.

### 15.4 `AiRetrievalService`

Tugas:

1. Mendeteksi nomor gigi dari pertanyaan.
2. Mendeteksi condition dari pertanyaan.
3. Mengambil detection relevan.
4. Mengambil knowledge relevan.
5. Menghitung similarity embedding jika diperlukan.

### 15.5 `AiPromptBuilderService`

Tugas:

1. Membuat prompt untuk LLM.
2. Memastikan prompt berisi aturan safety.
3. Memastikan prompt hanya berisi data yang diperlukan.

---

## 16. API / Controller Flow Detail

### 16.1 Admin Store Knowledge

```text
Request
↓
Validate input
↓
Create ai_knowledge_bases
↓
Generate embedding dari title + content
↓
Update embedding dan embedding_model
↓
Return success
```

Pseudo:

```php
public function store(StoreAiKnowledgeBaseRequest $request)
{
    $knowledge = $this->knowledgeService->create($request->validated());

    return redirect()
        ->route('admin.ai-knowledge-bases.show', $knowledge)
        ->with('success', 'Knowledge berhasil dibuat.');
}
```

### 16.2 Patient Send Message

```text
Request question
↓
Validate session ownership
↓
Save user message
↓
Parse question
↓
Find related detection
↓
Find related knowledge
↓
Build prompt
↓
Generate answer
↓
Save assistant message
↓
Save message sources
↓
Return answer
```

Pseudo:

```php
public function sendMessage(SendAiChatMessageRequest $request, AiChatSession $session)
{
    abort_unless($session->user_id === auth()->id(), 403);

    $result = $this->aiChatService->sendMessage(
        user: auth()->user(),
        session: $session,
        question: $request->input('message')
    );

    return response()->json($result);
}
```

---

## 17. Retrieval Logic MVP

### 17.1 Jika Pertanyaan Menyebut Nomor Gigi

Contoh:

```text
Gigi 38 saya kenapa?
```

Sistem:

```text
1. Ambil semua radiograf milik pasien
2. Cari detection no_fdi = 38
3. Ambil abnormality dari detection
4. Cari knowledge dengan condition_name = abnormality
```

### 17.2 Jika Pertanyaan Menyebut Penyakit

Contoh:

```text
Apa itu impaksi?
```

Sistem:

```text
1. condition_name = Impaksi
2. Cari knowledge active dengan condition_name = Impaksi
3. Jawab secara umum
```

### 17.3 Jika Pertanyaan Umum

Contoh:

```text
Bagaimana cara membaca hasil radiologi?
```

Sistem:

```text
1. Cari knowledge category = radiology_guide atau faq
2. Jika perlu, gunakan embedding similarity
3. Jawab berdasarkan knowledge
```

---

## 18. Prompt Rules

Chatbot harus memiliki instruksi tetap:

```text
Anda adalah Dentalyze AI, asisten edukasi pasien untuk menjelaskan hasil radiologi gigi.

Aturan:
1. Jawab hanya berdasarkan hasil radiologi pasien dan knowledge base yang diberikan.
2. Jangan mengambil informasi dari internet.
3. Jangan membuat diagnosis baru.
4. Jangan menyebut kondisi yang tidak ada di detection pasien.
5. Jangan memberikan resep obat.
6. Jangan memberikan keputusan tindakan medis final.
7. Jika informasi tidak cukup, katakan bahwa informasi belum cukup.
8. Gunakan bahasa Indonesia yang sederhana dan ramah.
9. Selalu beri disclaimer singkat bahwa jawaban bersifat edukasi dan tidak menggantikan dokter gigi.
```

---

## 19. Error and Empty State

### 19.1 Knowledge Tidak Ditemukan

Jika tidak ada knowledge aktif:

```text
Maaf, saya belum memiliki referensi yang cukup untuk menjelaskan kondisi tersebut. Silakan tanyakan langsung kepada dokter gigi untuk penjelasan lebih lanjut.
```

### 19.2 Detection Tidak Ditemukan

Jika pasien bertanya gigi tertentu tetapi detection tidak ada:

```text
Saya belum menemukan data hasil radiologi untuk gigi nomor tersebut pada hasil pemeriksaan Anda. Silakan pastikan nomor gigi yang dimaksud atau konsultasikan dengan dokter gigi.
```

### 19.3 Radiograf Bukan Milik Pasien

Response:

```text
403 Forbidden
```

### 19.4 LLM Error

Jika LLM gagal:

```text
Maaf, Dentalyze AI sedang mengalami kendala dalam memproses pertanyaan Anda. Silakan coba lagi beberapa saat lagi.
```

---

## 20. Frontend Requirements

### 20.1 Admin Knowledge Index Page

Halaman daftar knowledge.

Komponen:

1. Header: AI Knowledge Base
2. Button: Create Knowledge
3. Search input
4. Filter category
5. Filter status
6. Table knowledge

Kolom table:

```text
Title
Category
Condition
Status
Updated At
Action
```

### 20.2 Admin Create/Edit Knowledge Page

Form:

```text
Title
Category
Condition Name
Content
Status
Submit
Cancel
```

UX:

1. Content menggunakan textarea besar.
2. Tampilkan helper text: “Isi knowledge dengan bahasa yang mudah dipahami pasien.”
3. Tampilkan status embedding setelah berhasil disimpan.

### 20.3 Patient Chat Page

Komponen:

1. Chat header: Dentalyze AI
2. Disclaimer box
3. Message list
4. Input text
5. Send button
6. Loading indicator ketika chatbot menjawab

Disclaimer:

```text
Dentalyze AI membantu menjelaskan hasil radiologi Anda secara edukatif. Jawaban ini tidak menggantikan diagnosis dan konsultasi dokter gigi.
```

---

## 21. Suggested UI Layout

### 21.1 Admin Knowledge Page

```text
AI Knowledge Base
Kelola referensi internal yang digunakan Dentalyze AI untuk menjawab pertanyaan pasien.

[Create Knowledge]

Search...
Filter Category
Filter Status

| Title | Category | Condition | Status | Updated | Action |
```

### 21.2 Patient Chat Page

```text
Dentalyze AI

[Info]
Jawaban chatbot bersifat edukasi dan tidak menggantikan dokter gigi.

------------------------------------------------
User:
Gigi nomor 38 saya kenapa kok impaksi?

Dentalyze AI:
Berdasarkan hasil radiologi Anda...
------------------------------------------------

[ Tulis pertanyaan... ] [Send]
```

---

## 22. Acceptance Criteria

### 22.1 Admin Knowledge

Fitur dianggap selesai jika:

1. Admin dapat membuat knowledge.
2. Admin dapat mengisi title, category, condition_name, content, dan status.
3. Sistem menyimpan knowledge ke `ai_knowledge_bases`.
4. Sistem generate embedding setelah knowledge dibuat.
5. Admin dapat mengedit knowledge.
6. Jika content berubah, embedding diperbarui.
7. Knowledge dengan status `active` dapat digunakan chatbot.
8. Knowledge `draft` dan `inactive` tidak digunakan chatbot.

### 22.2 Patient Chat

Fitur dianggap selesai jika:

1. Pasien dapat membuka halaman chat.
2. Pasien dapat membuat chat session.
3. Pesan pasien tersimpan di `ai_chat_messages`.
4. Chatbot dapat mengambil detection yang relevan.
5. Chatbot dapat mengambil knowledge yang relevan.
6. Chatbot menjawab berdasarkan detection dan knowledge.
7. Jawaban assistant tersimpan di `ai_chat_messages`.
8. Source jawaban tersimpan di `ai_chat_message_sources`.
9. Pasien tidak dapat mengakses chat milik pasien lain.
10. Chatbot tidak menjawab dari internet.

---

## 23. Test Cases

### TC-001 — Admin Create Knowledge Active

Given admin login  
When admin membuat knowledge `Impaksi` dengan status `active`  
Then data tersimpan di `ai_knowledge_bases`  
And embedding berhasil dibuat  
And knowledge dapat digunakan chatbot.

### TC-002 — Admin Create Knowledge Draft

Given admin login  
When admin membuat knowledge dengan status `draft`  
Then data tersimpan  
And chatbot tidak menggunakan knowledge tersebut.

### TC-003 — Pasien Bertanya Gigi dengan Detection

Given pasien memiliki detection gigi 38 dengan abnormality `Impaksi`  
And ada knowledge active `Impaksi`  
When pasien bertanya “Gigi 38 saya kenapa?”  
Then chatbot menjawab tentang impaksi  
And jawaban menyebut gigi 38  
And source tersimpan di `ai_chat_message_sources`.

### TC-004 — Pasien Bertanya Condition Umum

Given ada knowledge active `Karies`  
When pasien bertanya “Apa itu karies?”  
Then chatbot menjelaskan karies berdasarkan knowledge.

### TC-005 — Knowledge Tidak Ada

Given tidak ada knowledge active untuk `Resorpsi`  
When pasien bertanya tentang resorpsi  
Then chatbot menjawab bahwa referensi belum cukup.

### TC-006 — Pasien Mengakses Session Orang Lain

Given pasien A login  
When pasien A membuka session milik pasien B  
Then sistem mengembalikan 403.

### TC-007 — Detection Tidak Ditemukan

Given pasien bertanya tentang gigi 38  
And tidak ada detection no_fdi 38 pada radiograf pasien  
Then chatbot menjawab bahwa data gigi tersebut belum ditemukan.

---

## 24. MVP Implementation Plan

### Phase 1 — Database dan Model

1. Buat migration.
2. Buat model:
   - `AiChatSession`
   - `AiChatMessage`
   - `AiKnowledgeBase`
   - `AiChatMessageSource`
3. Buat relasi antar model.

### Phase 2 — Admin Knowledge CRUD

1. Buat controller admin.
2. Buat halaman index.
3. Buat halaman create.
4. Buat halaman edit.
5. Buat service generate embedding.
6. Simpan embedding ke database.

### Phase 3 — Patient Chat

1. Buat halaman chat.
2. Buat endpoint create session.
3. Buat endpoint send message.
4. Simpan pesan user.
5. Ambil detection.
6. Ambil knowledge.
7. Build prompt.
8. Generate answer.
9. Simpan jawaban.
10. Simpan source.

### Phase 4 — Safety dan Testing

1. Tambahkan prompt safety.
2. Tambahkan authorization check.
3. Tambahkan empty state.
4. Tambahkan test case utama.
5. Uji beberapa kondisi: Impaksi, Karies, Normal, LesiPeriapikal, Resorpsi.

---

## 25. Kesimpulan

Fitur Chatbot RAG Dentalyze AI akan menggunakan database final:

```text
ai_chat_sessions
ai_chat_messages
ai_knowledge_bases
ai_chat_message_sources
```

Alur dimulai dari admin membuat knowledge sederhana berupa teks. Sistem membuat embedding dari knowledge tersebut. Saat pasien bertanya, sistem mengambil hasil radiologi dari `radiographs` dan `detections`, mengambil knowledge aktif dari `ai_knowledge_bases`, lalu menghasilkan jawaban edukatif.

Fitur ini sudah cukup untuk MVP karena sederhana, tidak menggunakan PDF/HTML, dan tetap aman karena jawaban chatbot berasal dari:

```text
hasil radiologi pasien
+
knowledge internal admin
+
prompt safety
```

Setiap jawaban juga bisa diaudit melalui `ai_chat_message_sources`, sehingga sistem dapat mengetahui knowledge, radiograf, dan detection mana yang digunakan untuk menghasilkan jawaban.
