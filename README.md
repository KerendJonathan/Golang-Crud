


# 📚 Goweb CRUD — Golang + React + MySQL
```
Aplikasi **CRUD Mahasiswa** full-stack:  
- **Backend**: Golang + Gin + GORM  
- **Frontend**: React + Vite + TypeScript + Tailwind  
- **Database**: MySQL  

Fitur: Upload foto profil, validasi form, pencarian, pagination, dan proxy dev server agar Frontend ↔ Backend berjalan lancar tanpa masalah CORS.


```
## 🛠 Teknologi
- **Go** 1.22+  
- **Node.js** 18+ (LTS disarankan)  
- **MySQL / MariaDB**  
- **npm / pnpm / yarn**  

---


```



---

## 🗄 Setup Database
```sql
CREATE DATABASE goweb;
USE goweb;

CREATE TABLE mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  npm CHAR(8) NOT NULL,
  nama VARCHAR(30) NOT NULL,
  kelas CHAR(10) NOT NULL,
  profile VARCHAR(30) NOT NULL
);

INSERT INTO mahasiswa (npm, nama, kelas, profile) VALUES
('01232432', 'Agus Supriyanto', '4IA17', 'logo.png'),
('92133423', 'Abidin Nugraha', '3IA07', 'logo.png');
````

---

## ⚙️ Instalasi & Menjalankan

### 🔹 Backend

```bash
cd goweb-crud/backend
go mod tidy
mkdir uploads
```

Buat file `.env`:

```env
APP_PORT=8080
APP_UPLOAD_DIR=./uploads

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=goweb

FRONTEND_ORIGINS=http://localhost:5173
```

Jalankan:

```bash
go run .
```

Cek: [http://localhost:8080/health](http://localhost:8080/health)

---

### 🔹 Frontend

```bash
cd goweb-crud/frontend
npm install
```

Install tambahan:

```bash
npm i axios react-router-dom react-hook-form zod @hookform/resolvers lucide-react sonner clsx
npm i -D tailwindcss postcss autoprefixer
```

Konfigurasi Tailwind (`tailwind.config.js`):

```js
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 600:'#3f55f5',700:'#2f44d6',800:'#2839aa' }
      }
    },
  },
}
```

Proxy di `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true },
    '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
  }
}
```

Jalankan:

```bash
npm run dev
```

Akses: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Reference

Base URL: `http://localhost:8080/api`

| Method | Endpoint         | Deskripsi                  |
| ------ | ---------------- | -------------------------- |
| GET    | `/mahasiswa`     | List (search + pagination) |
| GET    | `/mahasiswa/:id` | Detail by ID               |
| POST   | `/mahasiswa`     | Create (JSON/form-data)    |
| PUT    | `/mahasiswa/:id` | Update (JSON/form-data)    |
| DELETE | `/mahasiswa/:id` | Hapus data                 |

---

## 🧪 Contoh Request

### JSON

```http
POST /api/mahasiswa
Content-Type: application/json
```

```json
{
  "npm": "12345678",
  "nama": "Jonathan Doe",
  "kelas": "4IA17",
  "profile": "avatar.png"
}
```

### Form-Data

```bash
curl -X POST http://localhost:8080/api/mahasiswa \
  -F "npm=12345678" -F "nama=Jonathan Doe" -F "kelas=4IA17" \
  -F "profile=@/path/to/foto.jpg"
```

---

## 📌 Catatan

* `npm` wajib **8 digit**
* Upload max **2MB** (`.jpg`, `.jpeg`, `.png`, `.webp`)
* File tersimpan di `backend/uploads/`
* CORS diatur melalui `.env`
* GET sudah mendukung **search & pagination**

---

## 📦 Build Production

### Backend

```bash
cd backend
go build -o goweb-api
./goweb-api
```

### Frontend

```bash
cd frontend
npm run build
# hasil ada di folder dist/
```

---

## ❗ Troubleshooting

* **Error Tailwind `bg-brand-600`** → cek `tailwind.config.js` lalu restart `npm run dev`
* **CORS error** → cek `.env` → `FRONTEND_ORIGINS`
* **Error import Go** → pastikan path sesuai `go.mod`
* **Gagal init Tailwind di Windows** → gunakan `npx tailwindcss@3.4.10 init -p`

---

