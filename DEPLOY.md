# Panduan Deploy — nisanur.vercel.app

## Langkah 1: Push ke GitHub

Buka terminal di folder project ini, lalu jalankan:

```bash
git init
git add .
git commit -m "initial commit"
```

Buat repo baru di https://github.com/new (nama: `portfolio-nisanur`, kosong, jangan tambah README)

Lalu:
```bash
git remote add origin https://github.com/USERNAME/portfolio-nisanur.git
git branch -M main
git push -u origin main
```
Ganti `USERNAME` dengan username GitHub kamu.

---

## Langkah 2: Deploy Backend ke Railway

1. Buka https://railway.app → Login dengan GitHub
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repo `portfolio-nisanur`
4. Klik **Add Service** → **Database** → **PostgreSQL**
5. Klik service **backend** → tab **Settings**:
   - **Root Directory**: `backend`
   - **Start Command**: `node server.js`
6. Tab **Variables** → tambahkan satu per satu:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *Copy dari PostgreSQL service (sudah otomatis tersedia)* |
| `JWT_SECRET` | `portfolio-nisanur-secret-2026-ganti-ini` |
| `PORT` | `3001` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `admin123` |
| `FRONTEND_URL` | `https://nisanur.vercel.app` |

7. Railway akan deploy otomatis. Tunggu hingga status **Active**.
8. Klik domain yang muncul, contoh: `https://portfolio-nisanur-production.up.railway.app`
9. **Catat URL Railway ini** — akan dipakai di langkah berikutnya.

### Setup Database (lakukan sekali)
Di Railway, buka tab **Shell** pada service backend, lalu jalankan:
```bash
npx prisma migrate deploy
node prisma/seed.js
```

---

## Langkah 3: Deploy Frontend ke Vercel

1. Buka https://vercel.com → Login dengan GitHub
2. Klik **Add New Project** → Import repo `portfolio-nisanur`
3. Settings:
   - **Framework Preset**: Vite *(otomatis terdeteksi)*
   - **Root Directory**: `.` *(biarkan default)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://URL_RAILWAY_KAMU/api` |

   Ganti `URL_RAILWAY_KAMU` dengan URL dari langkah 2.

5. Klik **Deploy** → tunggu selesai.
6. Pergi ke **Settings → Domains** → ketik `nisanur` → klik **Add**
   - Domain final: `nisanur.vercel.app`

---

## Hasil Akhir

| Halaman | URL |
|---------|-----|
| Portfolio | https://nisanur.vercel.app |
| Admin Panel | https://nisanur.vercel.app/admin |
| Backend API | https://URL_RAILWAY/api |

**Login Admin:**
- Username: `admin`
- Password: `admin123`

> ⚠️ Ganti password segera setelah pertama login via Admin → Password section!

---

## Update setelah ada perubahan

Cukup push ke GitHub:
```bash
git add .
git commit -m "update"
git push
```
Vercel dan Railway akan auto-redeploy.
