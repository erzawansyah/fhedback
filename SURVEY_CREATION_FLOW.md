# Survey Creation Flow Documentation

## Overview
This document explains the complete survey creation flow in the FhedBack application, from initial configuration to final publication.

## System Architecture

### Core Components
1. **SurveyCreationContext**: Central state management for survey creation workflow
2. **SurveySettingsStep**: Survey configuration and blockchain deployment
3. **SurveyMetadataStep**: Survey metadata management
4. **SurveyQuestionsStep**: Questions management with submission controls
5. **Main Survey Page**: Orchestrates all steps with sidebar summary

## Survey Creation Flow

### Step 1: Survey Configuration (SurveySettingsStep)
- **Purpose**: Configure basic survey settings and deploy smart contract
- **Key Fields**:
  - Title
  - Question count
  - Respondent limit
  - Privacy setting (FHE enabled/disabled)
  - Scale limit (1-n rating)
- **Actions**:
  - Form validation using Zod schema
  - Smart contract deployment via blockchain transaction
  - Survey address storage in context
  - Automatic status update to "initialized"

### Step 2: Metadata Management (SurveyMetadataStep)
- **Purpose**: Set survey description, categories, and rating labels
- **Key Fields**:
  - Description
  - Categories
  - Min/Max rating labels
  - Tags
- **Functionality**:
  - Edit/Cancel workflow with form reset
  - IPFS/Pinata integration for metadata storage
  - Conditional editing (locked when questions submitted)
  - Automatic context synchronization

### Step 3: Questions Submission (SurveyQuestionsStep)
- **Purpose**: Define survey questions array
- **Features**:
  - Dynamic question addition/removal
  - Form validation for empty questions
  - One-time submission restriction
  - Only available when survey status === 'initialized' and metadata exists
- **Business Rules**:
  - Questions can only be submitted once
  - After submission, metadata becomes read-only
  - Enables publish functionality

### Step 4: Survey Publication
- **Purpose**: Make survey live for respondents
- **Triggers**: Appears when questions are submitted and status === 'initialized'
- **Process**:
  - Blockchain transaction to update survey status
  - Status change to "published"
  - Success/error feedback to user

## State Management

### SurveyConfig Interface
```typescript
interface SurveyConfig {
    address: Address | null;          // Smart contract address
    status: string | null;            // Survey status (initialized/published)
    title: string;                    // Survey title
    isFhe: boolean;                   // Privacy setting
    limitScale: number;               // Rating scale limit
    totalQuestions: number;           // Number of questions
    respondentLimit: number;          // Max respondents
    metadataCid: string | null;       // IPFS metadata CID
    questionsSubmitted: boolean;      // Questions submission status
}
```

### SurveyMetadata Interface
```typescript
interface SurveyMetadata {
    title: string;
    description: string;
    categories: string;
    minLabel: string;
    maxLabel: string;
    tags: string[];
}
```

## Context Functions

### Core Functions
- `setSurveyAddress(address)`: Set deployed contract address
- `resetSurveyConfig()`: Reset to default state
- `refresh()`: Refresh blockchain data
- `setQuestionsSubmitted(boolean)`: Track questions submission
- `publishSurvey()`: Publish survey to blockchain

### Data Fetching
- Automatic blockchain data fetching when address is set
- Survey type detection from factory contract
- Survey details from deployed contract
- Metadata retrieval from IPFS

## UI/UX Features

### Conditional Rendering
- Steps only appear when prerequisites are met
- Questions step requires initialized status + metadata
- Publish option requires questions submission
- Edit restrictions based on submission status

### Progress Indicators
- Real-time status display in sidebar
- Visual indicators for completed steps
- Color-coded status (green for completed, orange for pending)
- Emoji indicators for published surveys

### Error Handling
- Form validation with real-time feedback
- Transaction error handling
- Toast notifications for user feedback
- Loading states for async operations

## Blockchain Integration

### Smart Contracts
- Factory contract for survey deployment
- Individual survey contracts for data storage
- Transaction handling with wagmi hooks

### Utilities
- `createSurvey.ts`: Deploy new survey contract
- `setMetadata.ts`: Store metadata on IPFS
- `submitQuestions.ts`: Submit questions to blockchain
- `publishSurvey.ts`: Publish survey for responses

## Persistence
- LocalStorage synchronization via `useSyncedState`
- Automatic state persistence across sessions
- Context reset and refresh capabilities

## Flow Summary

1. **Initialize**: User creates survey configuration → deploys contract
2. **Configure**: User sets metadata → stores on IPFS
3. **Compose**: User adds questions → submits to blockchain (one-time only)
4. **Publish**: User publishes survey → becomes live for respondents

## Business Rules

### Submission Restrictions
- Questions can only be submitted once per survey
- Metadata becomes read-only after questions submission
- Publish option only available after questions submission
- All steps must be completed in sequence

### Status Progression
1. `null` → Survey not created
2. `initialized` → Contract deployed, ready for metadata/questions
3. `published` → Survey live and accepting responses

This architecture ensures data integrity, proper flow control, and excellent user experience throughout the survey creation process.
