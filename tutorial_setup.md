# Tutorial Setup: Supabase, NextAuth.js & Vercel untuk BulkMaster

> Dokumen ini adalah panduan langkah-demi-langkah untuk kamu yang baru pertama kali menggunakan Supabase, NextAuth.js, dan Vercel. Ikuti urutannya dari atas ke bawah.

---

## BAGIAN 1 — Setup Supabase (Database)

### Langkah 1.1 — Buat Akun & Project Baru

1. Buka [https://supabase.com](https://supabase.com)
2. Klik **"Start your project"** → Login dengan GitHub (direkomendasikan)
3. Setelah login, klik tombol **"New project"**
4. Isi form:
   - **Organization**: biarkan default (nama akunmu)
   - **Project name**: `bulkmaster`
   - **Database password**: buat password yang kuat, **SIMPAN password ini**, kamu butuh ini nanti
   - **Region**: pilih `Southeast Asia (Singapore)` agar latency rendah dari Indonesia
5. Klik **"Create new project"** — tunggu sekitar 1-2 menit hingga project selesai dibuat

---

### Langkah 1.2 — Ambil API Keys

Setelah project selesai dibuat:

1. Di sidebar kiri, klik **"Project Settings"** (ikon gear ⚙️)
2. Klik menu **"API"**
3. Kamu akan melihat dua value yang penting — **copy** dan simpan keduanya:

```
Project URL:      https://xxxxxxxxxxxxxxxxxxxx.supabase.co
anon public key:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **JANGAN share `service_role key` ke siapapun.** Key ini punya akses penuh ke database dan harus disimpan rahasia, hanya digunakan di server-side.

---

### Langkah 1.3 — Jalankan SQL Schema (Buat Semua Tabel)

1. Di sidebar kiri Supabase, klik **"SQL Editor"**
2. Klik tombol **"New query"** (ikon + di pojok kiri atas)
3. Copy seluruh SQL di bawah ini dan paste ke editor:

```sql
-- ============================================================
-- NEXTAUTH ADAPTER TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS "users" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT,
  email           TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  image           TEXT,
  password        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "accounts" (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId"             TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  type                 TEXT NOT NULL,
  provider             TEXT NOT NULL,
  "providerAccountId"  TEXT NOT NULL,
  refresh_token        TEXT,
  access_token         TEXT,
  expires_at           BIGINT,
  token_type           TEXT,
  scope                TEXT,
  id_token             TEXT,
  session_state        TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "sessions" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "sessionToken"  TEXT UNIQUE NOT NULL,
  "userId"        TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  expires         TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  identifier  TEXT NOT NULL,
  token       TEXT NOT NULL,
  expires     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================================
-- APLIKASI TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id           TEXT PRIMARY KEY REFERENCES "users"(id) ON DELETE CASCADE,
  username          TEXT UNIQUE,
  age               INT,
  height_cm         DECIMAL(5,2),
  weight_start_kg   DECIMAL(5,2),
  gender            TEXT CHECK (gender IN ('male', 'female')),
  activity_level    TEXT CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  tdee              DECIMAL(8,2),
  target_calories   DECIMAL(8,2),
  surplus_kcal      INT DEFAULT 300,
  current_phase     TEXT DEFAULT 'Bulking',
  onboarding_done   BOOLEAN DEFAULT FALSE,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  food_name   TEXT NOT NULL,
  brand       TEXT,
  barcode     TEXT,
  meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  calories    DECIMAL(8,2) NOT NULL,
  protein_g   DECIMAL(8,2) DEFAULT 0,
  carbs_g     DECIMAL(8,2) DEFAULT 0,
  fat_g       DECIMAL(8,2) DEFAULT 0,
  serving_g   DECIMAL(8,2) DEFAULT 100,
  logged_at   TIMESTAMPTZ DEFAULT NOW(),
  log_date    DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  session_name  TEXT DEFAULT 'Workout Session',
  notes         TEXT,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  log_date      DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name  TEXT NOT NULL,
  weight_kg      DECIMAL(6,2) DEFAULT 0,
  reps           INT DEFAULT 0,
  set_number     INT DEFAULT 1,
  rpe            DECIMAL(3,1),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  weight_kg   DECIMAL(5,2) NOT NULL,
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- ============================================================
-- INDEX untuk performa query
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date     ON food_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user   ON workout_sessions(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session    ON workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date   ON weight_logs(user_id, log_date);
```

4. Klik tombol **"Run"** (tombol hijau di pojok kanan bawah, atau tekan `Ctrl+Enter`)
5. Pastikan muncul pesan **"Success. No rows returned"** — ini berarti semua tabel berhasil dibuat

---

### Langkah 1.4 — Verifikasi Tabel Berhasil Dibuat

1. Di sidebar kiri, klik **"Table Editor"**
2. Kamu seharusnya melihat 7 tabel:
   - `users`
   - `accounts`
   - `sessions`
   - `verification_tokens`
   - `profiles`
   - `food_logs`
   - `workout_sessions`
   - `workout_sets`
   - `weight_logs`

Jika semua tabel sudah ada, setup Supabase selesai! ✅

---

### Langkah 1.5 — Setup Supabase Storage (untuk Photo Upload)

Fitur upload foto progress & avatar membutuhkan Supabase Storage.

1. Di sidebar kiri Supabase, klik **"Storage"**
2. Klik tombol **"New bucket"**
3. Isi konfigurasi:
   - **Bucket name**: `bulkmaster-media` ← **harus persis ini!**
   - **Public bucket**: ✅ Centang (agar foto bisa ditampilkan di app)
4. Klik **"Save"**
5. Setelah bucket dibuat, masuk ke bucket → klik tab **"Policies"**
6. Klik **"New policy"** → pilih **"Full customization"**
7. Tambahkan policy ini:
   - **Policy name**: `Users can upload their own files`
   - **Command**: INSERT
   - **Target roles**: authenticated
   - **USING expression**: `(auth.uid()::text = (storage.foldername(name))[1])`
8. Klik **Save**
9. Tambah satu policy lagi untuk READ (agar foto bisa dilihat publik):
   - **Policy name**: `Public can view files`
   - **Command**: SELECT
   - **Target roles**: public
   - **USING expression**: `true`

> 💡 **Atau cara cepat:** Di tab Policies bucket `bulkmaster-media`, klik **"Add policies" → "For full customization"** dan aktifkan semua operasi untuk authenticated users.

Setelah storage setup selesai, fitur upload foto akan berfungsi! ✅

---

## BAGIAN 2 — Setup Environment Variables (File `.env.local`)

File `.env.local` adalah file konfigurasi rahasia yang TIDAK boleh di-commit ke Git. File ini sudah otomatis ada di `.gitignore`.

### Langkah 2.1 — Buat File `.env.local`

Di root folder project BulkMaster (`c:\Users\Lenovo\Documents\.MICHAEL\Projek Website\bulkmaster`), buat file baru bernama `.env.local` dengan isi berikut:

```env
# ─── SUPABASE ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://GANTI_DENGAN_PROJECT_URL_KAMU.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=GANTI_DENGAN_ANON_KEY_KAMU
SUPABASE_SERVICE_ROLE_KEY=GANTI_DENGAN_SERVICE_ROLE_KEY_KAMU

# ─── NEXTAUTH ─────────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=GANTI_DENGAN_RANDOM_STRING_PANJANG
```

### Langkah 2.2 — Generate `AUTH_SECRET`

`AUTH_SECRET` harus berupa string acak yang panjang dan unik. Ada 2 cara:

**Cara A (pakai PowerShell, rekomendasi):**
```powershell
# Jalankan perintah ini di terminal PowerShell kamu:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```
Copy hasilnya dan paste sebagai nilai `AUTH_SECRET`.

**Cara B (online generator):**
Buka [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) → copy string yang muncul.

### Langkah 2.3 — Isi Nilai yang Benar

Ganti semua placeholder `GANTI_DENGAN_...` dengan nilai aktual dari Supabase yang sudah kamu copy di Langkah 1.2.

Contoh file `.env.local` yang sudah diisi:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4MDAwMDAwMCwiZXhwIjoxOTk1NTYwMDAwfQ.abc123
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.longerkeyhere...
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=kXpEzYw8mN2vR5qJhL9sT3aB6cD1eF4g
```

---

## BAGIAN 3 — Menjalankan Aplikasi Secara Lokal

Setelah semua file di-generate oleh Antigravity (saya), jalankan aplikasi:

```bash
# Di terminal, pastikan kamu berada di folder project:
cd "c:\Users\Lenovo\Documents\.MICHAEL\Projek Website\bulkmaster"

# Jalankan development server:
npm run dev
```

Buka browser ke [http://localhost:3000](http://localhost:3000).

**Urutan pengujian yang disarankan:**
1. Buka `/register` → buat akun baru
2. Login di `/login` dengan akun yang baru dibuat
3. Isi data di `/onboarding`
4. Cek dashboard menampilkan data real

---

## BAGIAN 4 — Deploy ke Vercel

### Langkah 4.1 — Push Project ke GitHub

Sebelum deploy, project harus ada di GitHub:

1. Buat repository baru di [https://github.com/new](https://github.com/new)
   - Repository name: `bulkmaster`
   - Set ke **Private** (karena ada config sensitif di `.env.local` — tapi `.env.local` sudah masuk `.gitignore` jadi aman)
2. Di terminal, jalankan:
```bash
git remote add origin https://github.com/USERNAME_GITHUB_KAMU/bulkmaster.git
git branch -M main
git add .
git commit -m "feat: initial backend integration"
git push -u origin main
```

### Langkah 4.2 — Import Project ke Vercel

1. Buka [https://vercel.com](https://vercel.com) → login dengan GitHub
2. Klik **"Add New... → Project"**
3. Cari repository `bulkmaster` yang baru kamu push → klik **"Import"**
4. Vercel otomatis mendeteksi ini adalah Next.js project
5. **JANGAN klik Deploy dulu** — kamu harus tambah environment variables terlebih dahulu

### Langkah 4.3 — Setup Environment Variables di Vercel

Masih di halaman import project, scroll ke bawah ke bagian **"Environment Variables"**.

Tambahkan satu per satu (klik "Add" untuk setiap variable):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase kamu |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase kamu |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase kamu |
| `NEXTAUTH_URL` | `https://NAMA-PROJECT-KAMU.vercel.app` (akan tahu URL ini setelah deploy pertama) |
| `AUTH_SECRET` | String acak yang sama dengan di `.env.local` |

> ⚠️ **Untuk `NEXTAUTH_URL`:** Saat pertama deploy, kamu belum tahu URL Vercel-nya. Deploy dulu dengan nilai sementara, lalu setelah dapat URL Vercel, update nilainya dan redeploy.

### Langkah 4.4 — Deploy!

1. Klik tombol **"Deploy"**
2. Tunggu proses build selesai (biasanya 1-3 menit)
3. Setelah berhasil, Vercel akan menampilkan URL production seperti:
   `https://bulkmaster-username.vercel.app`

### Langkah 4.5 — Update `NEXTAUTH_URL` (Post-Deploy)

1. Setelah dapat URL production, kembali ke Vercel Dashboard
2. Pilih project `bulkmaster` → **Settings → Environment Variables**
3. Edit `NEXTAUTH_URL` → isi dengan URL production yang benar: `https://bulkmaster-username.vercel.app`
4. Klik **Save** → Vercel akan otomatis redeploy

### Langkah 4.6 — Whitelist Domain di Supabase (PENTING)

1. Kembali ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project `bulkmaster`
3. Klik **"Project Settings" → "API"**
4. Scroll ke bagian **"Allowed URLs"** (atau **"Site URL"**)
5. Tambahkan URL Vercel kamu: `https://bulkmaster-username.vercel.app`
6. Klik **Save**

---

## BAGIAN 5 — Troubleshooting Umum

### ❌ Error: `NEXTAUTH_URL` tidak cocok
**Gejala:** Login redirect ke URL yang salah atau error `redirect_uri_mismatch`
**Solusi:** Pastikan `NEXTAUTH_URL` di Vercel env vars sudah diisi dengan URL production yang benar (bukan localhost).

### ❌ Error: `Invalid API Key` dari Supabase
**Gejala:** API routes return 401 atau database query gagal
**Solusi:** Double-check bahwa nilai di environment variables Vercel sudah benar. Salin ulang dari Supabase Dashboard.

### ❌ Error: `NEXTAUTH_SECRET` is not set
**Gejala:** Console error saat login
**Solusi:** Pastikan `AUTH_SECRET` sudah diisi di env vars. Generate ulang jika perlu.

### ❌ Error: Tabel tidak ditemukan di database
**Gejala:** API routes return error `relation "profiles" does not exist`
**Solusi:** Jalankan ulang SQL di Langkah 1.3 di Supabase SQL Editor.

### ❌ Error: `bcrypt` module not found
**Gejala:** Server crash saat register
**Solusi:** Jalankan `npm install bcryptjs @types/bcryptjs` di terminal project.

---

## Checklist Akhir

Centang semua ini sebelum testing:

- [ ] Akun Supabase dibuat & project `bulkmaster` aktif
- [ ] SQL schema sudah dijalankan (semua 9 tabel muncul di Table Editor)
- [ ] File `.env.local` sudah dibuat dengan nilai yang benar
- [ ] `AUTH_SECRET` sudah di-generate dan bukan string kosong
- [ ] `npm run dev` berjalan tanpa error
- [ ] Register akun baru berhasil
- [ ] Login berhasil dan masuk ke dashboard
- [ ] (Untuk production) Vercel env vars sudah diisi semua
- [ ] (Untuk production) `NEXTAUTH_URL` sudah diupdate ke URL production
- [ ] (Untuk production) Domain Vercel sudah diwhitelist di Supabase
