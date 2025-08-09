# Legacy Projects

This `_legacy` folder contains earlier stages of the **fhedback** platform's development, preserved for historical and reference purposes.  
Most of the projects here are **incomplete prototypes** or early experiments, except for `contracts/questionnaire`, which reached a more complete implementation stage.

## Structure

```
_legacy/
├── contracts/              # Early smart contract implementations
│   ├── questionnaire/      # First complete and functional questionnaire contract (submitted for Developer Program Level 3 - Explorer)
│   └── zama-fhe/           # Early experiments using Zama's Fully Homomorphic Encryption (incomplete)
│
├── frontend/               # First working frontend attempt (incomplete, not production-ready)
│   └── *Note: This frontend was nearly finished, but the project was ultimately restructured because Next.js could not be used for the required features.*
└── frontend_legacy/        # Even earlier frontend experiment (incomplete)
```

## Historical Context

- **`contracts/questionnaire/`**  
    The only fully functional component in this folder. Represents the first completed implementation of the questionnaire smart contract, which later served as the foundation for the current contracts.
    
- **`contracts/zama-fhe/`**  
    An unfinished proof-of-concept exploring Zama's FHE technology for privacy-preserving computation on-chain. Development stopped before reaching full deployment readiness.

- **`frontend/`**  
    A partial frontend build intended to interact with the questionnaire contracts. Work on this version stopped before finalization.

- **`frontend_legacy/`**  
    An even earlier, abandoned frontend prototype. Retained only for historical and reference purposes.

## Development Timeline

| Component               | First Commit Date | Last Commit Date |
|-------------------------|-------------------|------------------|
| contracts/questionnaire | 2025-08-09        | 2025-08-09       |
| contracts/zama-fhe      | 2025-08-09        | 2025-08-09       |
| frontend                | 2025-08-09        | 2025-08-09       |
| frontend_legacy         | 2025-08-09        | 2025-08-09       |

> **Note:** Dates above reflect when these components were imported into the monorepo.  
> The actual development of some components may have started much earlier, as seen in their individual commit history.

## Purpose of Keeping Legacy Code

- **Historical transparency** — Shows how the platform evolved from early experiments to the current architecture.
- **Reference material** — Useful for revisiting old approaches or reusing snippets from earlier work.
- **Proof of progress** — Commit history here demonstrates the iterative nature of the platform's development.

## Notes

- These projects may **not run** without significant dependency updates.
- Only `contracts/questionnaire` reached a functional, complete state.
- Modern development for fhedback happens in the root-level `contracts/` and `frontend/` directories.
