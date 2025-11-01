# 🔐 FHEdback - Confidential Survey Platform

> Platform survey berbasis **Fully Homomorphic Encryption (FHE)** yang menjamin privasi absolut. Respon individual tetap terenkripsi selamanya, namun tetap memungkinkan analisis statistik agregat oleh pembuat survey.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-orange)](https://docs.soliditylang.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://fhedback.vercel.app)

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

## 🔗 Live Demo & Smart Contracts

### 🌐 Aplikasi Live

**Frontend Demo:**
- **Primary**: [https://fhedback.vercel.app](https://fhedback.vercel.app)
- **Alternative**: [https://fhedback.mew3.xyz](https://fhedback.mew3.xyz)

**Network**: Sepolia Testnet (Chain ID: 11155111)

### 📜 Smart Contracts (Sepolia)

**Factory Contract** - Main Entry Point

```
Address:  0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15
Status:   ✅ Active
Network:  Sepolia Testnet
Purpose:  Factory untuk membuat survey contracts baru
Explorer: https://eth-sepolia.blockscout.com/address/0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15
```

**Example Survey Contract**

```
Address:  0x353E12EE4A861737c1604fF6Abe5684879970421
Status:   ✅ Active Survey Instance
Explorer: https://eth-sepolia.blockscout.com/address/0x353E12EE4A861737c1604fF6Abe5684879970421
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

1. **Akses aplikasi**: Buka [fhedback.vercel.app](https://fhedback.vercel.app)
2. **Connect wallet**: Sambungkan wallet MetaMask atau lainnya
3. **Buat survey**: Gunakan form builder untuk membuat survey
4. **Share link**: Bagikan link survey ke responden
5. **Lihat hasil**: Akses dashboard untuk melihat statistik agregat

### Untuk Developer

Lihat dokumentasi lengkap di:
- **Smart Contracts**: [contracts/README.md](contracts/README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Create feature branch: `git checkout -b feature/nama-fitur`
3. Commit changes: `git commit -m "feat: deskripsi"`
4. Push to branch: `git push origin feature/nama-fitur`
5. Open Pull Request

---

## 📄 License

Project ini menggunakan **MIT License**.

---

## 🙏 Acknowledgments

- **[Zama](https://zama.ai/)** - FHE Technology & FHEVM
- **[OpenZeppelin](https://openzeppelin.com/)** - Smart Contract Libraries
- **[Hardhat](https://hardhat.org/)** - Development Framework

---

## 📞 Contact

- **Repository**: [github.com/erzawansyah/fhedback](https://github.com/erzawansyah/fhedback)
- **Live Demo**: [fhedback.vercel.app](https://fhedback.vercel.app)
- **Owner**: [@erzawansyah](https://github.com/erzawansyah)

---

**Built with ❤️ using Zama's Fully Homomorphic Encryption**
