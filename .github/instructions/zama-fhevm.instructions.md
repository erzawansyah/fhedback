# AI Coding Instructions for FHE Questionnaire Contract

## Project Overview

This is a **privacy-preserving questionnaire system** built on Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine). The core innovation is that survey responses remain encrypted on-chain while still enabling statistical computations.

Refer to the official Zama FHEVM protocol documentation for full guidance:
https://docs.zama.ai/protocol

## Key Architecture Components

### 1. FHE Data Types & Patterns

- **Encrypted types**: `euint8`, `euint64`, `ebool` from `@fhevm/solidity/lib/FHE.sol`
- **External inputs**: `externalEuint8[]` for encrypted user inputs
- **Permission system**: Use `FHE.allowThis()` and `FHE.allow(value, address)` for access control
- **Initialization check**: Always use `FHE.isInitialized()` before accessing encrypted values

```solidity
// Pattern: Initialize encrypted statistical data
euint8 initialQuestionMinScore = FHE.asEuint8(scaleLimit);
FHE.allowThis(initialQuestionMinScore);
FHE.allow(initialQuestionMinScore, msg.sender);
```

### 2. State Machine Pattern

Questionnaires follow strict lifecycle: `Initialized → Draft → Published → Closed/Trashed`

- Use status-specific modifiers: `onlyInitialized`, `onlyDraft`, `onlyPublished`, `onlyClosed`
- Status transitions are enforced through function modifiers
- Each transition emits specific events from `QuestionnaireEvents`

### 3. Modular Error & Event System

- **Errors**: Centralized in `contracts/modules/QuestionnaireErrors.sol` as library
- **Events**: Centralized in `contracts/modules/QuestionnaireEvents.sol` as library
- Pattern: `revert ERRORS.ErrorName()` and `emit EVENTS.EventName(...)`

## Critical Development Workflows

### Testing with FHE

```bash
npm run test                    # Run all tests
npm run compile                 # Compile contracts + generate types
npm run typechain              # Generate TypeScript types
```

**FHE Testing Pattern**: Cannot directly test encrypted values - focus on:

- State transitions and access control
- Event emissions
- Error conditions with `revertedWithCustomError`
- Public statistical outputs (when decrypted by authorized parties)

### Network Configuration

- **Local**: Hardhat network (chainId: 31337)
- **Testnet**: Sepolia with FHEVM support
- **Config inheritance**: Contracts inherit `SepoliaConfig` for FHE setup

## Project-Specific Conventions

### Constructor Validation Pattern

```solidity
// Always validate in constructor with specific errors
if (bytes(_title).length == 0) revert ERRORS.InvalidTitle();
if (_scaleLimit < 2 || _scaleLimit > 10) revert ERRORS.InvalidScale();
```

### Statistical Data Architecture

Dual-level statistics maintained encrypted:

- **Per-question**: `questionTotalScore`, `questionMinScore`, `questionMaxScore`
- **Per-respondent**: `respondentTotalScore`, `respondentMinScore`, `respondentMaxScore`

### Access Control Patterns

- **Owner-only**: Functions use `onlyOwner` modifier
- **Respondent privacy**: `hasResponded[address]` is encrypted (`ebool`)
- **Response privacy**: Individual responses encrypted with `euint8`
- **Statistical queries**: Return encrypted results for authorized decryption

## File Structure Conventions

```
contracts/
├── FHEQuestionnaire.sol           # Main contract
├── modules/
│   ├── QuestionnaireErrors.sol    # Error definitions
│   └── QuestionnaireEvents.sol    # Event definitions
test/
├── FHEQuestionnaire.test.ts       # Main test suite
types/                             # Auto-generated TypeScript types
deploy/
└── deploy.ts                      # Deployment scripts
```

## Integration Points

### FHEVM Dependencies

- Import `@fhevm/solidity/lib/FHE.sol` for encrypted operations
- Inherit from `SepoliaConfig` for network-specific FHE setup
- Use `@fhevm/hardhat-plugin` for testing environment

### TypeChain Integration

- TypeScript types auto-generated in `types/` directory
- Factory patterns: `FHEQuestionnaire__factory` for deployment
- Test imports: `import { FHEQuestionnaire, FHEQuestionnaire__factory } from "../types"`

## Common Gotchas

1. **FHE Permissions**: Always call `FHE.allowThis()` and `FHE.allow()` after creating encrypted values
2. **Status Validation**: Use appropriate modifiers - don't manually check status in function body
3. **Array Bounds**: Question IDs are 1-based, not 0-based (`for (uint256 i = 1; i <= totalQuestions; i++)`)
4. **Encrypted Comparisons**: Use FHE comparison functions, not standard Solidity comparisons
5. **Testing Limitations**: Cannot assert encrypted values directly - test through state changes and events

## Build Commands

- `npm run clean` - Full cleanup including FHE temp files
- `npm run compile` - Compile with TypeChain generation
- `npm run prettier:write` - Format all files
- `npm run lint` - Run Solidity and TypeScript linting

## Context7 FHEVM Documentation

- Use the Context7-compatible library ID `/zama-ai/fhevm` to fetch up-to-date FHEVM API references via context7 tools.
- Core FHEVM operations, type definitions, and usage patterns are documented at:
  - Official Zama protocol docs: https://docs.zama.ai/protocol
  - Context7 library docs (e.g., `mcp_context7_get-library-docs context7CompatibleLibraryID="/zama-ai/fhevm"`)
