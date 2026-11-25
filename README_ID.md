# 🔐 FHEdback - Confidential Survey Platform

> Platform survey berbasis **Fully Homomorphic Encryption (FHE)** yang menjamin privasi absolut. Respon individual tetap terenkripsi selamanya, namun tetap memungkinkan analisis statistik agregat oleh pembuat survey.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-orange)](https://docs.soliditylang.org/)
[![Demo](https://img.shields.io/badge/demo-archived-lightgrey)](https://fhedback.vercel.app)
[![Zama Developer Program](https://img.shields.io/badge/Zama%20Developer%20Program-winner%20Oct%202025-yellow)](https://zama.ai/)
[![CI](https://github.com/erzawansyah/fhedback/actions/workflows/ci.yml/badge.svg)](https://github.com/erzawansyah/fhedback/actions/workflows/ci.yml)

---

## 📌 Status Proyek

**Dibekukan (demo diarsipkan).** FHEdback memenangkan Zama Developer Program pada Oktober 2025 dan kini disimpan sebagai implementasi referensi.

- Dibangun untuk **FHEVM v0.9** dengan `@zama-fhe/relayer-sdk` **0.3.0-5** di Sepolia. Versi ini sengaja dikunci.
- Relayer Sepolia milik Zama sudah berubah sejak itu. [Demo](https://fhedback.vercel.app) masih bisa dibuka, tetapi membuat, mengisi, dan mendekripsi survey tidak lagi berjalan di sana.
- Contract masih bisa di-compile dan test suite berjalan di atas mock FHEVM lokal (lihat [contracts/README.md](contracts/README.md)).
- Menghidupkan kembali demo berarti meng-upgrade stack FHEVM dan men-deploy ulang factory. Itu belum direncanakan.

---

## 🌟 Overview

### ❌ Masalah Platform Survey Tradisional

Dalam platform survey tradisional, terdapat risiko signifikan terhadap privasi:

- **Akses Tidak Terbatas**: Jawaban individu dapat diakses oleh pembuat survey atau pihak ketiga
- **Risiko Kebocoran Data**: Data tersimpan dalam bentuk plain text atau enkripsi sederhana
- **Anonimisasi Tidak Sempurna**: Data individu masih dapat dihubungkan kembali ke responden
- **Kepercayaan Terpusat**: Bergantung pada administrator untuk menjaga privasi

### ✅ Solusi FHEdback

FHEdback memanfaatkan **Fully Homomorphic Encryption (FHE)** dari Zama untuk memberikan solusi revolusioner:

**Bagaimana FHE Bekerja:**
- Jawaban **dienkripsi di sisi klien** sebelum dikirim
- Data **tetap terenkripsi** sepanjang waktu di blockchain
- Operasi matematika dilakukan **langsung pada data terenkripsi**
- Hasil agregat dapat **didekripsi tanpa mengakses data individual**

**Hasil:**
Pembuat survey mendapatkan insights statistik yang akurat tanpa pernah bisa melihat jawaban individual responden.

### 🎯 Keunggulan FHEdback

- **🔒 Privasi Absolut**: Jawaban individual tidak pernah dapat diakses dalam bentuk teks biasa
- **🛡️ Keamanan Tinggi**: Data selalu terenkripsi end-to-end, mengurangi risiko pelanggaran data
- **📊 Analisis Statistik**: Mendukung berbagai operasi statistik pada data terenkripsi (sum, average, min, max, frequency)
- **🌐 Desentralisasi**: Data tersimpan on-chain, tidak ada single point of failure
- **🔍 Transparansi**: Smart contract open source memungkinkan audit independen
- **⚡ Zero-Knowledge Proofs**: Validasi respon tanpa mengungkap nilai sebenarnya

### 👥 Siapa yang Membutuhkan FHEdback?

> *"Siapapun yang peduli dengan privasi data mereka dapat memanfaatkan FHEdback untuk mengumpulkan wawasan tanpa mengorbankan privasi."*

- **Organisasi Riset**: Survey sensitif dengan jaminan privasi responden
- **Perusahaan**: Employee feedback tanpa risiko identifikasi individual
- **Institusi Pendidikan**: Evaluasi pembelajaran yang aman dan privat
- **Healthcare**: Survey kesehatan dengan compliance HIPAA/GDPR
- **Pemerintah**: Polling publik dengan privasi terjamin

---

## 🔄 Survey Lifecycle

### Alur Kerja FHEdback

```
1. CREATE      →  Pembuat survey mendefinisikan pertanyaan dan metadata
                  Survey contract di-deploy ke blockchain
   ↓
2. PUBLISH     →  Survey dipublikasikan dan dapat diakses responden
                  FHE statistics diinisialisasi
   ↓
3. RESPOND     →  Responden mengisi survey
                  Jawaban dienkripsi dengan FHE di sisi klien
                  Data terenkripsi dikirim ke blockchain
   ↓
4. STORE       →  Jawaban terenkripsi disimpan on-chain
                  Statistics di-update secara homomorphic
   ↓
5. CLOSE       →  Survey ditutup setelah mencapai target responden
                  atau ditutup manual oleh pembuat survey
   ↓
6. ANALYZE     →  Pembuat survey dapat mengakses statistik agregat
                  Dekripsi hanya untuk data agregat, bukan individual
```

### Kapan Survey Bisa Dianalisis?

- ✅ Survey mencapai **jumlah responden minimum** yang telah ditentukan
- ✅ Pembuat survey **menutup survey secara manual** lebih awal
- ❌ Jawaban individual **tidak pernah** bisa diakses dalam bentuk terbuka

---

## 🔗 Demo & Smart Contracts

> Demo dan contract di bawah berasal dari submission Developer Program (FHEVM v0.9). Lihat [Status Proyek](#-status-proyek): demo masih bisa dibuka, tetapi operasi FHE tidak lagi berjalan dengan relayer Sepolia saat ini.

### 🌐 Demo (diarsipkan)

**Frontend Demo:**
- **Primary**: [https://fhedback.vercel.app](https://fhedback.vercel.app)
- **Alternative**: [https://fhedback.mew3.xyz](https://fhedback.mew3.xyz)

**Network**: Sepolia Testnet (Chain ID: 11155111)

### 📜 Smart Contracts (Sepolia)

**Factory Contract** - Main Entry Point

```
Address:  0x82C34294A1D9c8e38B43CE916D0C566416b1d7DC
Status:   Ter-deploy (FHEVM v0.9, tidak lagi dilayani relayer saat ini)
Network:  Sepolia Testnet
Purpose:  Factory untuk membuat survey contracts baru
Explorer: https://eth-sepolia.blockscout.com/address/0x82C34294A1D9c8e38B43CE916D0C566416b1d7DC
```

**Example Survey Contract**

```
Address:  0x1d1eBa567d9797e344AEBed9e29b8966B7084960
Status:   Contoh instance survey (FHEVM v0.9)
Explorer: https://eth-sepolia.blockscout.com/address/0x1d1eBa567d9797e344AEBed9e29b8966B7084960
```

### 🏗️ Arsitektur Contract

**ConfidentialSurvey_Factory**
- Membuat instance ConfidentialSurvey baru untuk setiap survey
- Setiap survey memiliki alamat contract unik
- Factory mencatat dan mengelola semua survey yang dibuat
- Memudahkan tracking dan management survey

**ConfidentialSurvey**
- Individual survey instance dengan FHE capabilities
- Menyimpan pertanyaan, metadata, dan encrypted responses
- Mengelola lifecycle survey (Created → Active → Closed)
- Menyediakan statistik agregat terenkripsi

---

## 📚 Dokumentasi Teknis

Untuk dokumentasi teknis lengkap, silakan tinjau README di masing-masing direktori:

### 📁 Smart Contracts

**[contracts/README.md](contracts/README.md)**
- Implementasi smart contract lengkap
- Pengelolaan pembuatan survey
- Penyimpanan jawaban terenkripsi
- Proses agregasi data dengan FHE
- Testing & deployment guide

### 📁 Frontend Application

**[frontend/README.md](frontend/README.md)**
- Kode sumber aplikasi web
- Pembuatan dan publikasi survey
- Interface pengisian jawaban
- Visualisasi hasil agregat
- Setup & development guide

---

## 🚀 Quick Start

### Untuk Pengguna (Non-Technical)

> Alur ini menggambarkan cara aplikasi bekerja selama Developer Program. Alur ini tidak lagi bisa diselesaikan di demo yang diarsipkan.

1. **Akses aplikasi**: Buka [fhedback.vercel.app](https://fhedback.vercel.app)
2. **Connect wallet**: Sambungkan wallet MetaMask atau lainnya
3. **Buat survey**: Gunakan form builder untuk membuat survey
4. **Share link**: Bagikan link survey ke responden
5. **Lihat hasil**: Akses dashboard untuk melihat statistik agregat

### Untuk Developer

Lihat dokumentasi lengkap di:
- **Smart Contracts**: [contracts/README.md](contracts/README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)

Daftar area pengembangan potensial (tipe pertanyaan baru, insentif, pencegahan bot, statistik lanjutan, BeaconProxy) ada di [README.md](README.md#-potential-development-areas).

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Create feature branch: `git checkout -b feature/nama-fitur`
3. Commit changes: `git commit -m "feat: deskripsi"`
4. Push to branch: `git push origin feature/nama-fitur`
5. Open Pull Request

---

## 🗂️ Riwayat

FHEdback berkembang dari tiga eksperimen sebelumnya, yang kini disimpan di [`_legacy/`](_legacy/README.md):

- `questionnaire_contracts` → `_legacy/contracts/questionnaire` (contract lengkap pertama, Developer Program Level 3)
- `zama-fhe-contract` → `_legacy/contracts/zama-fhe` (eksperimen FHE pertama)
- `questionnaire_frontend` → `_legacy/frontend_legacy` (frontend pertama)

---

## 📄 Lisensi

Kode milik FHEdback dirilis dengan [MIT License](LICENSE), termasuk smart contract Solidity di `contracts/contracts/` (header SPDX `MIT`).

Scaffold `contracts/` (konfigurasi Hardhat, tasks, dan tooling) diturunkan dari [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template) milik Zama dan tetap memakai lisensi aslinya, [BSD-3-Clause-Clear](contracts/LICENSE). Karena itu `contracts/package.json` mencantumkan `(MIT AND BSD-3-Clause-Clear)`.

---

## 🙏 Acknowledgments

- **[Zama](https://zama.ai/)** - FHE Technology & FHEVM
- **[OpenZeppelin](https://openzeppelin.com/)** - Smart Contract Libraries
- **[Hardhat](https://hardhat.org/)** - Development Framework

---

## 📞 Contact

- **Repository**: [github.com/erzawansyah/fhedback](https://github.com/erzawansyah/fhedback)
- **Demo (diarsipkan)**: [fhedback.vercel.app](https://fhedback.vercel.app)
- **Owner**: [@erzawansyah](https://github.com/erzawansyah)

---

**Built with ❤️ using Zama's Fully Homomorphic Encryption**
