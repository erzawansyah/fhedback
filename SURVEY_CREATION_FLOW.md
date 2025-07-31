# Dokumentasi Flow Pembuatan Survey - FHEDBack

## Gambaran Umum Arsitektur

Aplikasi FHEDBack menggunakan arsitektur berbasis React dengan Next.js yang terintegrasi dengan blockchain untuk pembuatan survey terenkripsi. Proses pembuatan survey terdiri dari 3 langkah utama yang harus diselesaikan secara berurutan.

## Struktur Komponen Utama

### 1. Layout dan Provider (`layout.tsx`)
- **Provider**: `SurveyCreationProvider` membungkus seluruh halaman pembuatan survey
- **Context**: Menyediakan state management global untuk seluruh proses pembuatan survey
- **Lokasi**: `src/app/creator/new/layout.tsx`

### 2. Halaman Utama (`page.tsx`)
- **Komponen**: `NewSurveyPage` sebagai halaman utama
- **Layout**: Grid 4 kolom dengan area utama (3 kolom) dan sidebar (1 kolom)
- **State Tracking**: Menggunakan `useSurveyCreationContext` untuk melacak progress
- **Conditional Rendering**: Menampilkan langkah-langkah berdasarkan status completion

## Context Management System

### SurveyCreationContext (`SurveyCreationContext.tsx`)

#### State Management
```typescript
interface SurveyCreationContextType {
    config: SurveyCreationConfig | null;          // Konfigurasi dasar survey
    metadata: SurveyCreationMetadata | null;      // Metadata survey (judul, deskripsi, dll)
    questions: SurveyCreationQuestions | null;    // Daftar pertanyaan survey
    surveyAddress: Address | null;                // Alamat kontrak survey di blockchain
    steps: SurveyCreationStep;                    // Status completion setiap langkah
    errors: SurveyCreationError[];                // Error handling dan tracking
    isLoading: boolean;                           // Loading state global
    refreshed: boolean;                           // Refresh state
}
```

#### Step Management
```typescript
interface SurveyCreationStep {
    step1: boolean; // Survey Settings - Konfigurasi dasar
    step2: boolean; // Survey Metadata - Informasi tambahan
    step3: boolean; // Survey Questions - Pertanyaan survey
}
```

#### Fungsi Utama Context
- **setSurveyAddress()**: Menetapkan alamat kontrak dan mengaktifkan step 2
- **setMetadataCid()**: Menandai metadata selesai dan mengaktifkan step 3
- **setQuestionsStatus()**: Menandai pertanyaan selesai
- **resetSteps()**: Reset seluruh proses pembuatan survey
- **Error Management**: Sistem auto-cleanup error setelah 5 menit

## Flow Pembuatan Survey (3 Langkah)

### LANGKAH 1: Survey Settings (`SurveySettingsStep.tsx`)

#### Tujuan
Membuat kontrak survey di blockchain dengan pengaturan dasar yang tidak dapat diubah setelah deployment.

#### Proses Teknis
1. **Form Validation**: Validasi input menggunakan schema validation
2. **Wallet Verification**: 
   ```typescript
   await handleSign() // Meminta signature wallet untuk verifikasi
   ```
3. **Contract Deployment**:
   ```typescript
   const hash = await createSurvey(data) // Deploy kontrak ke blockchain
   ```
4. **Transaction Monitoring**: Menunggu konfirmasi transaksi
5. **Address Extraction**: Mengambil alamat kontrak dari transaction receipt
6. **Context Update**: 
   ```typescript
   setSurveyAddress(contractAddress) // Update context dan aktifkan step 2
   ```

#### Data yang Dikonfigurasi
- **Title**: Judul survey
- **Limit Scale**: Skala penilaian (1-10)
- **Total Questions**: Jumlah maksimal pertanyaan
- **Respondent Limit**: Batas jumlah responden
- **Encrypted**: Status enkripsi survey (Boolean)

#### Status Tracking
- **Idle**: Belum dimulai
- **Signing**: Meminta signature wallet
- **Loading**: Proses deployment
- **Verifying**: Menunggu konfirmasi blockchain
- **Success**: Kontrak berhasil di-deploy
- **Error**: Terjadi kesalahan

#### Karakteristik Khusus
- **Immutable**: Data tidak dapat diubah setelah deployment
- **Blockchain Transaction**: Memerlukan gas fee
- **Form Disabled**: Setelah sukses, form menjadi non-editable

### LANGKAH 2: Survey Metadata (`SurveyMetadataStep.tsx`)

#### Tujuan
Menambahkan metadata tambahan ke survey yang sudah di-deploy, termasuk informasi yang dapat diubah kemudian.

#### Dependency
- **Prerequisite**: Step 1 harus selesai (surveyAddress tersedia)
- **Conditional Rendering**: Hanya muncul jika `steps.step1 === true`

#### Proses Teknis
1. **Address Validation**: Memastikan contract address tersedia
2. **Wallet Signature**: 
   ```typescript
   const { isVerified, signature, message } = await handleSign()
   ```
3. **Data Preparation**:
   ```typescript
   const preparedData = {
       address: account.address,
       signature,
       message,
       data: {
           title: data.displayTitle,
           description: data.description,
           categories: data.category,
           minLabel: data.scaleLabels.minLabel,
           maxLabel: data.scaleLabels.maxLabel,
           tags: data.tags.split(",").map(tag => tag.trim())
       }
   }
   ```
4. **Metadata Upload**: 
   ```typescript
   const txHash = await setMetadata(contractAddress, preparedData)
   ```
5. **CID Storage**: Menyimpan Content Identifier dari IPFS
6. **Step Activation**: Mengaktifkan step 3

#### Data yang Dikonfigurasi
- **Display Title**: Judul yang ditampilkan (dapat berbeda dari contract title)
- **Description**: Deskripsi lengkap survey
- **Category**: Kategori survey
- **Scale Labels**: Label untuk skala minimum dan maksimum
- **Tags**: Tag untuk kategorisasi dan pencarian

#### Edit Mode Feature
```typescript
const [isEditing, setIsEditing] = useState(false)
const [temporaryValue, setTemporaryValue] = useState<SurveyMetadataType | null>(null)
```
- **Edit Capability**: Metadata dapat diedit setelah dikonfigurasi
- **Temporary Storage**: Menyimpan nilai sementara saat editing
- **Cancel Functionality**: Dapat membatalkan perubahan

#### Status Management
- **Completed State**: Menampilkan "(Configured)" jika selesai
- **Edit Activation**: Tombol edit muncul setelah completion
- **Loading States**: Signing, Loading, Verifying, Success, Error

### LANGKAH 3: Survey Questions (`SurveyQuestionsStep.tsx`)

#### Tujuan
Menambahkan pertanyaan-pertanyaan survey ke kontrak yang sudah memiliki metadata.

#### Dependency
- **Prerequisite**: Step 2 harus selesai (metadata tersedia)
- **Conditional Rendering**: Hanya muncul jika `steps.step2 === true`
- **Metadata Check**: Menampilkan pesan tunggu jika metadata belum siap

#### Proses Teknis
1. **Prerequisites Validation**:
   ```typescript
   if (encrypted === undefined || encrypted === null) {
       throw new Error("Survey encryption setting is not defined")
   }
   ```
2. **Wallet Verification**: Sama seperti langkah sebelumnya
3. **Questions Data Preparation**:
   ```typescript
   const questionsData = {
       address: account.address,
       signature,
       message,
       encrypted,
       questions: data.questions.map(q => q.text)
   }
   ```
4. **Blockchain Submission**:
   ```typescript
   const txHash = await submitQuestions(contractAddress, questionsData)
   ```
5. **Final Status Update**: Menandai seluruh proses selesai

#### Data yang Dikonfigurasi
- **Questions Array**: Array string berisi teks pertanyaan
- **Encryption Integration**: Menggunakan setting enkripsi dari step 1
- **Dynamic Length**: Jumlah pertanyaan sesuai limit yang ditetapkan di step 1

#### Validation Rules
- **Question Text**: Tidak boleh kosong
- **Maximum Questions**: Sesuai dengan `totalQuestions` dari step 1
- **Encryption Consistency**: Harus sesuai dengan setting dari contract

#### Completion Status
- **Final Step**: Setelah selesai, seluruh survey creation process complete
- **Immutable**: Pertanyaan tidak dapat diedit setelah disubmit
- **Blockchain Storage**: Pertanyaan disimpan di blockchain (terenkripsi jika diaktifkan)

## Progress Tracking System

### ProgressTrackerCard (`ProgressTrackerCard.tsx`)

#### Visual Progress Indicator
```typescript
const progressSteps = [
    { name: "Survey Settings", completed: steps.step1, icon: Target },
    { name: "Metadata", completed: steps.step2, icon: FileText },
    { name: "Questions", completed: steps.step3, icon: HelpCircle }
]
```

#### Progress Calculation
- **Percentage**: `(completedSteps / totalSteps) * 100`
- **Visual Bar**: Progress bar dengan animasi
- **Step Status**: Individual status untuk setiap langkah
- **Completion Badge**: Badge dinamis menunjukkan progress

#### User Experience Features
- **Hover Effects**: Scale animation saat hover
- **Color Coding**: 
  - Hijau untuk completed steps
  - Abu-abu untuk pending steps
- **Status Messages**: 
  - "✓ Done" untuk completed
  - "Pending" untuk incomplete
  - "🎉 Ready to publish!" untuk all complete

## State Management Hooks

### useSurveySteps (`useSurveyCreation.ts`)

#### Functionality
Mengelola state untuk setiap langkah pembuatan survey dengan pattern yang konsisten.

#### State Variables
```typescript
const [status, setStatus] = useState<SurveyCreationStatus>("idle")
const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
const [errorMessage, setErrorMessage] = useState<string | null>(null)
```

#### Transaction Management
```typescript
const { data: receipt, error, isSuccess, isError, isLoading } = useWaitForTransactionReceipt({
    hash: txHash ? txHash : undefined,
    query: { enabled: !!txHash }
})
```

#### Signature & Verification Process
1. **Account Check**: Validasi alamat wallet tersedia
2. **Status Update**: Set status ke "signing"
3. **Sign Message**: Request signature dari wallet
4. **Verification**: Verifikasi signature
5. **Return Data**: Return signature dan message untuk transaksi selanjutnya

## Sidebar Components

### NewSurveySidebar (`sidebar.tsx`)

#### Komponen Sidebar
1. **PublishSurveyCard**: Muncul saat semua langkah selesai
2. **BestPracticesCard**: Tips dan panduan pembuatan survey
3. **TechnicalInfoCard**: Informasi teknis kontrak survey

#### Responsive Design
- **Sticky Position**: Mengikuti scroll halaman
- **Max Height**: Dibatasi sesuai viewport
- **Scrollable**: Auto scroll untuk konten panjang
- **Custom Scrollbar**: Styling khusus untuk scrollbar

## Error Handling System

### Error Management Context
```typescript
interface SurveyCreationError {
    id: string;                    // Unique identifier
    message: string;               // Pesan error
    name?: string;                 // Nama error
    code?: string;                 // Kode error
    timestamp: number;             // Waktu terjadinya error
    severity: 'error' | 'warning' | 'info'; // Tingkat severity
}
```

### Auto-Cleanup System
- **Timeout**: Error otomatis dihapus setelah 5 menit
- **Duplicate Prevention**: Mencegah error duplikat dalam 1 detik
- **Maximum Limit**: Maksimal 10 error disimpan
- **Memory Management**: Cleanup timeout references saat unmount

### Error Display & Interaction
- **Toast Notifications**: Error ditampilkan sebagai toast
- **Manual Clearing**: User dapat menutup error secara manual
- **Error List**: Error disimpan dalam array untuk tracking

## Teknologi & Dependencies

### Blockchain Integration
- **wagmi**: Wallet connection dan blockchain interaction
- **viem**: Ethereum client library
- **Smart Contracts**: Custom survey contracts

### State Management
- **React Context**: Global state management
- **useSyncedState**: Custom hook untuk localStorage sync
- **useState/useEffect**: Local component state

### UI/UX Libraries
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling framework
- **Sonner**: Toast notifications
- **shadcn/ui**: UI component library

### Form Management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **TypeScript**: Type safety

## Data Flow Architecture

### 1. Initialization Flow
```
Layout (Provider) → Page Component → Context Initialization → Hook Setup
```

### 2. Step Progression Flow
```
Form Submit → Wallet Sign → Blockchain Transaction → Receipt → Context Update → Next Step Activation
```

### 3. Error Flow
```
Error Occurrence → Error Context → Toast Display → Auto Cleanup Timer
```

### 4. Reset Flow
```
Reset Button → Context Reset → Local Storage Clear → Component Re-render
```

## Security Considerations

### Wallet Security
- **Signature Verification**: Setiap transaksi memerlukan signature wallet
- **Address Validation**: Validasi alamat wallet di setiap step
- **Transaction Verification**: Monitoring transaction receipt

### Data Integrity
- **Immutable Settings**: Step 1 data tidak dapat diubah
- **Blockchain Storage**: Data disimpan di blockchain untuk transparansi
- **Encryption Support**: Optional encryption untuk privacy

### Error Security
- **Sensitive Data**: Error tidak mengekspos private key atau sensitive data
- **Rate Limiting**: Duplicate error prevention
- **Memory Safety**: Auto cleanup untuk mencegah memory leak

## Performance Optimizations

### State Management
- **useMemo**: Optimasi untuk computed values
- **useCallback**: Optimasi untuk function references
- **Conditional Rendering**: Render komponen hanya saat dibutuhkan

### Memory Management
- **Ref Cleanup**: Cleanup timeout references
- **Component Unmount**: Proper cleanup saat unmount
- **Error Timeout**: Auto cleanup error setelah timeout

### User Experience
- **Loading States**: Clear feedback untuk setiap action
- **Progress Tracking**: Visual progress untuk user guidance
- **Optimistic Updates**: Local state update sebelum blockchain confirmation

## Kesimpulan

Sistem pembuatan survey FHEDBack menggunakan arsitektur yang robust dengan:

1. **3-Step Progressive Flow**: Langkah berurutan yang logis dan user-friendly
2. **Blockchain Integration**: Penyimpanan data yang terdesentralisasi dan transparent
3. **Comprehensive Error Handling**: Sistem error management yang sophisticated
4. **Real-time Progress Tracking**: Visual feedback untuk user experience
5. **Security-First Approach**: Wallet verification di setiap step kritikal
6. **Performance Optimized**: Memory management dan state optimization
7. **Type Safety**: Full TypeScript integration untuk development safety

Sistem ini dirancang untuk memberikan experience yang smooth bagi user sambil memastikan data integrity dan security dalam environment blockchain.
