# Survey Steps State Management Refactoring

## Overview
Ketiga bagian state management (`config`, `metadata`, `questions`) telah berhasil dipindahkan dari `SurveyCreationContext` ke dalam hooks yang sudah ada (`useSetSurveyConfig`, `useSetSurveyMetadata`, `useSetSurveyQuestions`). Setiap hook sekarang mengelola state-nya sendiri menggunakan `useSyncedState`.

## Perubahan pada Hooks yang Sudah Ada

### 1. `useSetSurveyConfig`
Sekarang mengelola state config secara internal.

**Lokasi:** `src/hooks/survey-steps/useSetSurveyConfig.ts`

**Perubahan Interface:**
```typescript
// Sebelum
interface useSetSurveyConfigProps {
  config: SurveyCreationConfig | null;
  isEnabled: boolean;
  onConfigUpdate: (config: Partial<SurveyCreationConfig>) => void;
  onError: (error: {...}) => void;
}

// Sesudah
interface useSetSurveyConfigProps {
  isEnabled: boolean;
  onError: (error: {...}) => void;
}
```

**Return Value Baru:**
```typescript
const {
  // State (baru)
  config,                    // SurveyCreationConfig | null
  
  // State management methods (baru)
  setConfig,                 // Direct setter
  updateConfig,              // Partial update function
  setSurveyAddress,          // Set survey address function
  resetConfig,               // Reset to null
  
  // Original functionality (tetap)
  isLoading,
  error,
  data,
  refreshStep1,
  contractConfigs,
} = useSetSurveyConfig({ isEnabled, onError });
```

### 2. `useSetSurveyMetadata`
Sekarang mengelola state metadata secara internal.

**Lokasi:** `src/hooks/survey-steps/useSetSurveyMetadata.ts`

**Perubahan Interface:**
```typescript
// Sebelum
interface useSetSurveyMetadataProps {
  config: SurveyCreationConfig | null;
  metadata: SurveyCreationMetadata | null;
  isEnabled: boolean;
  contractConfigs: {...};
  onMetadataUpdate: (metadata: Partial<SurveyCreationMetadata>) => void;
  onError: (error: {...}) => void;
}

// Sesudah
interface useSetSurveyMetadataProps {
  config: SurveyCreationConfig | null;
  isEnabled: boolean;
  contractConfigs: {...};
  onError: (error: {...}) => void;
}
```

**Return Value Baru:**
```typescript
const {
  // State (baru)
  metadata,                  // SurveyCreationMetadata | null
  
  // State management methods (baru)
  setMetadata,               // Direct setter
  updateMetadata,            // Partial update function
  resetMetadata,             // Reset to null
  
  // Original functionality (tetap)
  isLoading,
  error,
  data,
  refreshStep2,
} = useSetSurveyMetadata({ config, isEnabled, contractConfigs, onError });
```

### 3. `useSetSurveyQuestions`
Sekarang mengelola state questions secara internal.

**Lokasi:** `src/hooks/survey-steps/useSetSurveyQuestions.ts`

**Perubahan Interface:**
```typescript
// Sebelum
interface useSetSurveyQuestionsProps {
  config: SurveyCreationConfig | null;
  isEnabled: boolean;
  contractConfigs: {...};
  onQuestionsUpdate: (questions: SurveyCreationQuestions) => void;
  onError: (error: {...}) => void;
}

// Sesudah
interface useSetSurveyQuestionsProps {
  config: SurveyCreationConfig | null;
  isEnabled: boolean;
  contractConfigs: {...};
  onError: (error: {...}) => void;
}
```

**Return Value Baru:**
```typescript
const {
  // State (baru)
  questions,                 // SurveyCreationQuestions | null (string[])
  
  // State management methods (baru)
  setQuestions,              // Direct setter
  updateQuestions,           // Update function
  resetQuestions,            // Reset to null
  
  // Original functionality (tetap)
  isLoading,
  error,
  data,
  refreshStep3,
} = useSetSurveyQuestions({ config, isEnabled, contractConfigs, onError });
```

## Perubahan pada SurveyCreationContext

### Sebelum:
```typescript
// State langsung di context
const [config, setConfig] = useSyncedState<SurveyCreationConfig | null>("survey_creation.config", null);
const [metadata, setMetadata] = useSyncedState<SurveyCreationMetadata | null>("survey_creation.metadata", null);
const [questions, setQuestions] = useSyncedState<SurveyCreationQuestions | null>("survey_creation.questions", null);

// Menggunakan hooks dengan callback
const step1 = useSetSurveyConfig({
  config,
  isEnabled: steps.step1,
  onConfigUpdate: handleConfigUpdate,
  onError: addError
});
```

### Sesudah:
```typescript
// Hooks mengelola state mereka sendiri
const configHook = useSetSurveyConfig({
  isEnabled: steps.step1,
  onError: addError
});

const metadataHook = useSetSurveyMetadata({
  config: configHook.config,  // Menggunakan state dari configHook
  isEnabled: steps.step1,
  contractConfigs: configHook.contractConfigs,
  onError: addError
});

const questionsHook = useSetSurveyQuestions({
  config: configHook.config,  // Menggunakan state dari configHook
  isEnabled: steps.step3,
  contractConfigs: configHook.contractConfigs,  
  onError: addError
});

// Extract state untuk context
const { config, setSurveyAddress: setSurveyAddressFromHook, resetConfig } = configHook;
const { metadata, resetMetadata } = metadataHook;
const { questions, resetQuestions } = questionsHook;
```

## Keuntungan Refactoring

1. **Consolidation:** State management sekarang berada di dalam hooks yang sudah ada
2. **Consistency:** Pendekatan yang konsisten - hooks mengelola state mereka sendiri
3. **Maintainability:** Lebih mudah dirawat karena semua logic terkait di satu tempat
4. **Reusability:** Hooks dapat digunakan di komponen lain dengan state management built-in
5. **Type Safety:** Tetap mempertahankan type safety dengan TypeScript
6. **localStorage Sync:** Tetap menggunakan `useSyncedState` untuk sinkronisasi

## Cara Penggunaan

### Opsi 1: Menggunakan Hook Langsung (Baru)
```typescript
import { useSetSurveyConfig } from '@/hooks/survey-steps';

const MyComponent = () => {
  const { config, updateConfig, setSurveyAddress } = useSetSurveyConfig({
    isEnabled: true,
    onError: (error) => console.error(error)
  });
  
  // Hook sudah mengelola state sendiri
  return <div>...</div>;
};
```

### Opsi 2: Menggunakan Context (Existing Way - Tetap Berfungsi)
```typescript
import { useSurveyCreationContext } from '@/context/SurveyCreationContext';

const MyComponent = () => {
  const { config, metadata, questions } = useSurveyCreationContext();
  
  // Context tetap berfungsi seperti sebelumnya
  return <div>...</div>;
};
```

## Files yang Diubah

### Diubah:
- `src/hooks/survey-steps/useSetSurveyConfig.ts` (menambahkan state management internal)
- `src/hooks/survey-steps/useSetSurveyMetadata.ts` (menambahkan state management internal)
- `src/hooks/survey-steps/useSetSurveyQuestions.ts` (menambahkan state management internal)
- `src/context/SurveyCreationContext.tsx` (menggunakan hooks yang sudah dimodifikasi)

### Dihapus (file sementara yang tidak jadi digunakan):
- Hooks baru yang tidak jadi digunakan telah dihapus

## Backward Compatibility

✅ **Fully backward compatible** - Semua komponen yang menggunakan `useSurveyCreationContext` akan tetap berfungsi tanpa perubahan kode.

## State Management Flow

```
useSetSurveyConfig (manages config state internally)
    ↓
useSetSurveyMetadata (uses config from useSetSurveyConfig)
    ↓
useSetSurveyQuestions (uses config from useSetSurveyConfig)
    ↓
SurveyCreationContext (aggregates all states from hooks)
    ↓
Components (consume via context or directly from hooks)
```

## Error Handling

Setiap hook tetap menggunakan error handling yang sama seperti sebelumnya, dengan `setSurveyAddress` memiliki built-in validation yang akan throw error jika address null/empty.
