<div align="center">
  <img src="https://cdn.nefusoft.cloud/vLOkV.jpg" alt="Majotabi Banner" width="100%" style="border-radius: 10px;"/>

  # 🚀 MAJOTABI - WABOT

  <a href="https://github.com/alip-jmbd/Majotabi-WAbot">
    <img src="https://img.shields.io/badge/Release-v1.1.0-green?style=for-the-badge&logo=github">
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/Node.js-v22-blue?style=for-the-badge&logo=nodedotjs">
  </a>
  <a href="https://www.sqlite.org/">
    <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite">
  </a>
  <a href="https://github.com/WhiskeySockets/Baileys">
    <img src="https://img.shields.io/badge/Library-Baileys-orange?style=for-the-badge&logo=whatsapp">
  </a>

  <p align="center">
    <strong>Bot WhatsApp Modular, Cepat, dan Stabil dengan Arsitektur Plugin Modern.</strong>
  </p>
</div>

---

## 📑 Tentang Project

**Majotabi-WAbot** adalah bot WhatsApp berbasis **Node.js** yang dibangun di atas library `@whiskeysockets/baileys`. Project ini dirancang dengan fokus pada **kestabilan**, **efisiensi memori**, dan **kemudahan pengembangan**.

Menggunakan sistem **Plugin Modular**, memungkinkan Anda menambah atau mengubah fitur tanpa perlu mematikan bot. Dilengkapi dengan database **SQLite** untuk manajemen data yang ringan namun handal.

## ✨ Fitur Unggulan

### ⚙️ Core & System
*   🔥 **Hot Reload Real-time**: Edit file di folder `plugins`, `lib`, atau `handler` dan perubahan langsung aktif tanpa restart.
*   🛡️ **Smart Error Handling**: Bot tidak akan mati (crash) hanya karena satu plugin error. Error dilaporkan ke log dan owner.
*   🧹 **Auto-Cleaner**: Pembersihan otomatis file sampah (tmp) setiap 3 menit untuk menjaga kesehatan disk server.
*   🆔 **Smart ID Detection**: Mendukung penuh format ID baru WhatsApp (`LID`) untuk grup dan `JID` untuk personal chat.

### 💎 Database & User Management
*   🗄️ **Better-SQLite3**: Penyimpanan data lokal yang sangat cepat (WAL Mode enabled).
*   👑 **Premium System**: Manajemen user premium dengan durasi (Expired otomatis & Notifikasi).

### 🚀 Media Processing
*   ⚡ **RAM-Based Processing**: Pembuatan stiker dan manipulasi gambar diproses di RAM untuk menghindari error `Disk Full`.

---

## 🛠️ Tech Stack

*   **Runtime**: Node.js (Recomendasi v22+)
*   **Library**: @whiskeysockets/baileys
*   **Database**: better-sqlite3
*   **Logger**: Pino (Custom Silent Stream)
*   **Media**: wa-sticker-formatter (Native FFmpeg)

---

## 📥 Instalasi & Penggunaan

Pastikan Anda telah menginstal **Node.js** dan **Git** di sistem Anda.

### 1. Clone Repositori
```bash
git clone https://github.com/alip-jmbd/Majotabi-WAbot.git
cd Majotabi-WAbot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi
Buka file `src/config.js` dan sesuaikan dengan data Anda:

```javascript
export default {
    ownerNumber: ["628xxx", "2385xxx"],       // Nomor Owner (Gunakan format internasional tanpa +, tambahkan juga LID owner disini)
    ownerName: "Nama Owner",       // Nama Owner
    botName: "Majotabi - WAbot",   // Nama Bot
    thumbnail: "https://...",      // URL Thumbnail Menu (Besar)
    subThumbnail: "https://...",   // URL Thumbnail Adreply (Kecil)
    siteUrl: "https://...",        // URL Web/Link
    sessionName: "session",        // Nama folder sesi
    public: true,                  // Mode Public (true) atau Self (false)
    browser: ["Ubuntu", "Chrome", "20.0.04"]
}
```

### 4. Jalankan Bot
```bash
npm start
```
_Masukkan Kode Pairing ke WhatsApp._

---

## 📂 Struktur File

Project ini menggunakan struktur folder yang rapi untuk memudahkan maintenance:

```
Majotabi-WAbot/
├── session/             # Data otentikasi WhatsApp (Otomatis dibuat)
├── tmp/                 # Folder sementara (Otomatis dibersihkan)
├── src/
│   ├── index.js         # Entry point utama & Connection handler
│   ├── handler.js       # Penanganan pesan masuk & command parser
│   ├── config.js        # Konfigurasi global bot
│   ├── lib/             # Library fungsi-fungsi pembantu (Database, Serialize, dll)
│   └── plugins/         # Folder tempat semua fitur bot berada
│       ├── main/        # Menu, Info, Ping
│       ├── owner/       # Fitur khusus Owner (Addprem, Exec, dll)
│       ├── tools/       # Tools (Sticker, Smeme, CDN)
│       ├── nsfw/        # Fitur NSFW Premium
│       └── waifu/       # Fitur Anime Image
└── package.json
```

---

## 🤝 Kontribusi

Tertarik mengembangkan fitur baru?
1.  Fork repositori ini.
2.  Buat branch fitur baru (`git checkout -b fitur-keren`).
3.  Commit perubahan Anda (`git commit -m 'Menambah fitur keren'`).
4.  Push ke branch (`git push origin fitur-keren`).
5.  Buat Pull Request.

---

<div align="center">
  <p>Dibuat oleh <strong>Lipp Majotabi</strong></p>
  <p>© 2025 Majotabi-WAbot. All rights reserved.</p>
</div>
