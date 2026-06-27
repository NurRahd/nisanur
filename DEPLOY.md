# Deploy ke Vercel + Supabase

## Stack
- **Frontend + API**: Vercel (Serverless Functions)
- **Database**: Supabase (PostgreSQL)
- **Storage gambar**: Supabase Storage

---

## Langkah 1: Setup Supabase

1. Buka https://supabase.com → New project
   - Name: `nisanur`
   - Password: buat yang kuat, **catat!**
   - Region: Southeast Asia (Singapore)
2. Tunggu ~2 menit hingga ready.

### Ambil credentials:
Pergi ke **Settings → API**:
- Copy **Project URL** → ini `SUPABASE_URL`
- Copy **service_role** key (bukan anon) → ini `SUPABASE_SERVICE_KEY`

Pergi ke **Settings → Database → Connection string**:
- Tab **Transaction** (port 6543) → ini `DATABASE_URL`
- Tab **Session** (port 5432) → ini `DIRECT_URL`

### Buat Storage bucket:
1. Pergi ke **Storage** → **New bucket**
2. Name: `portfolio`
3. Centang **Public bucket** → Save

### Jalankan migration (dari lokal):
Isi `.env.local` dengan semua credentials Supabase, lalu:
```bash
npx prisma migrate deploy
node prisma/seed.js
```

---

## Langkah 2: Push ke GitHub

```bash
git add .
git commit -m "ready for deploy"
git remote add origin https://github.com/USERNAME/nisanur.git
git branch -M main
git push -u origin main
```

---

## Langkah 3: Deploy ke Vercel

1. Buka https://vercel.com → **Add New Project**
2. Import repo `nisanur` dari GitHub
3. Settings:
   - **Framework**: Vite
   - **Root Directory**: `.` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables** — tambahkan semua ini:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | string acak panjang |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | password kamu |
| `SUPABASE_URL` | `https://XXXX.supabase.co` |
| `SUPABASE_SERVICE_KEY` | service_role key dari Supabase |
| `VITE_SUPABASE_URL` | `https://XXXX.supabase.co` (sama dengan SUPABASE_URL) |
| `VITE_API_URL` | `/api` |
| `FRONTEND_URL` | `https://nisanur.vercel.app` |

5. Klik **Deploy**

6. Setelah deploy → **Settings → Domains** → ketik `nisanur` → Add
   - URL: `https://nisanur.vercel.app`

---

## Hasil

| | URL |
|--|-----|
| Portfolio | https://nisanur.vercel.app |
| Admin | https://nisanur.vercel.app/admin |
| API | https://nisanur.vercel.app/api/health |

**Login admin**: `admin` / password yang kamu set

> ⚠️ Ganti password via Admin → Password segera!

---

## Update kode

```bash
git add .
git commit -m "update"
git push
```
Vercel auto-redeploy dalam ~1 menit.
