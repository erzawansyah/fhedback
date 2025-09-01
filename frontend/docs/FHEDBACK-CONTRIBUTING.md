# 🤝 Contributing to FHEdback

Thank you for your interest in contributing to FHEdback! This document provides guidelines and information for contributors to help maintain code quality and project consistency.

## 🎯 Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Node.js** 20+ and npm 7+
- **Git** for version control
- **Basic understanding** of React, TypeScript, and Solidity
- **MetaMask** or compatible Web3 wallet for testing
- **Sepolia testnet ETH** for contract interactions

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/fhedback.git
   cd fhedback
   ```

3. **Set up the frontend**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your values
   npm run dev
   ```

4. **Set up smart contracts**:
   ```bash
   cd ../contracts
   npm install
   npm run setup:env  # Follow prompts to configure environment
   npm run compile
   npm run test
   ```

## 🔧 Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Feature development branches
- **fix/**: Bug fix branches
- **docs/**: Documentation updates

### Creating a Feature

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/survey-analytics
   ```

2. **Make your changes** following our coding standards
3. **Test thoroughly** (unit, integration, manual)
4. **Commit with conventional commits**:
   ```bash
   git commit -m "feat(analytics): add survey response analytics dashboard"
   ```

5. **Push and create a Pull Request**:
   ```bash
   git push origin feature/survey-analytics
   ```

## 📝 Coding Standards

### TypeScript Guidelines

**Use strict TypeScript**:
```typescript
// ✅ Good
interface SurveyProps {
  id: string
  title: string
  onSubmit: (data: FormData) => Promise<void>
}

// ❌ Avoid
function createSurvey(data: any) { ... }
```

**Prefer type-safe patterns**:
```typescript
// ✅ Good - Type-safe with literal types
export const SURVEY_STATUS = {
  CREATED: 0,
  ACTIVE: 1,
  CLOSED: 2,
  TRASHED: 3
} as const

type SurveyStatus = typeof SURVEY_STATUS[keyof typeof SURVEY_STATUS]

// ❌ Avoid - Magic numbers
if (status === 1) { ... }
```

### React Component Guidelines

**Use function components with TypeScript**:
```typescript
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

**Custom hooks for complex logic**:
```typescript
// ✅ Good - Extract complex logic
export function useSurveyCreation() {
  const [state, setState] = useState<CreationState>('idle')
  
  const createSurvey = useCallback(async (data: SurveyData) => {
    setState('creating')
    try {
      // Complex creation logic
      setState('success')
    } catch (error) {
      setState('error')
    }
  }, [])
  
  return { state, createSurvey }
}
```

### Smart Contract Guidelines

**Follow Solidity style guide**:
```solidity
// ✅ Good
contract ConfidentialSurvey {
    uint256 public constant MAX_QUESTIONS = 15;
    
    mapping(address => bool) public hasResponded;
    
    event SurveyCreated(
        address indexed owner,
        string symbol,
        string metadataCID
    );
    
    modifier onlyOwner() {
        require(msg.sender == survey.owner, "not owner");
        _;
    }
}
```

**Use NatSpec documentation**:
```solidity
/**
 * @dev Creates a new confidential survey
 * @param _owner Address that will own the survey
 * @param _symbol Symbol for the survey (max 10 characters)
 * @param _metadataCID IPFS CID containing survey metadata
 * @notice Survey starts in Created state and must be published
 * @notice Emits SurveyCreated event upon successful creation
 */
function createSurvey(
    address _owner,
    string memory _symbol,
    string memory _metadataCID
) external returns (address);
```

## 📁 File Organization

### Frontend Structure
```
src/
├── components/
│   ├── ui/                 # Base UI components
│   ├── layout/             # Layout components  
│   └── forms/              # Form components
├── routes/                 # Page components
├── hooks/                  # Custom React hooks
├── services/
│   ├── contracts/          # Smart contract interfaces
│   ├── wagmi.ts           # Web3 configuration
│   └── api/               # API integrations
├── types/                  # TypeScript definitions
└── utils/                  # Helper functions
```

### Naming Conventions

**Files and folders**: Use kebab-case
```
✅ survey-creation-form.tsx
✅ use-survey-data.ts
❌ SurveyCreationForm.tsx
❌ useSurveyData.ts
```

**Components**: Use PascalCase
```typescript
✅ export function SurveyCard() { ... }
✅ export const SurveyCreationForm = () => { ... }
```

**Functions and variables**: Use camelCase
```typescript
✅ const surveyData = await fetchSurvey()
✅ function handleSubmission() { ... }
```

## 🧪 Testing Guidelines

### Frontend Testing

**Write tests for components**:
```typescript
import { render, screen } from '@testing-library/react'
import { SurveyCard } from './SurveyCard'

describe('SurveyCard', () => {
  it('displays survey title and description', () => {
    render(
      <SurveyCard 
        title="Test Survey" 
        description="Test description"
      />
    )
    
    expect(screen.getByText('Test Survey')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})
```

**Test custom hooks**:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useSurveyCreation } from './useSurveyCreation'

describe('useSurveyCreation', () => {
  it('handles survey creation flow', async () => {
    const { result } = renderHook(() => useSurveyCreation())
    
    act(() => {
      result.current.createSurvey(mockSurveyData)
    })
    
    expect(result.current.state).toBe('creating')
  })
})
```

### Smart Contract Testing

**Comprehensive test coverage**:
```typescript
describe("ConfidentialSurvey", () => {
  it("should create survey with correct parameters", async () => {
    const survey = await deployFixture()
    
    const surveyData = await survey.survey()
    expect(surveyData.owner).to.equal(owner.address)
    expect(surveyData.symbol).to.equal("TEST")
    expect(surveyData.status).to.equal(0) // Created
  })
  
  it("should prevent non-owner from publishing", async () => {
    const survey = await deployFixture()
    
    await expect(
      survey.connect(alice).publishSurvey([5, 5, 5])
    ).to.be.revertedWith("not owner")
  })
})
```

## 🎨 UI/UX Guidelines

### Design System

- **Use Radix UI** for accessible component primitives
- **TailwindCSS** for styling with consistent spacing/colors
- **Lucide React** for icons
- **Follow WCAG 2.1 AA** accessibility guidelines

### Component Patterns

**Compound components** for complex UI:
```typescript
// ✅ Good - Flexible and composable
<Survey.Card>
  <Survey.Title>Survey Title</Survey.Title>
  <Survey.Description>Description text</Survey.Description>
  <Survey.Actions>
    <Button>Edit</Button>
    <Button variant="destructive">Delete</Button>
  </Survey.Actions>
</Survey.Card>
```

### Responsive Design

- **Mobile-first** approach
- **Flexible layouts** using CSS Grid and Flexbox
- **Consistent breakpoints** following Tailwind defaults

## 🔐 Security Considerations

### Smart Contract Security

- **Follow OpenZeppelin patterns** for access control
- **Use ReentrancyGuard** for external calls
- **Validate all inputs** at contract level
- **Test edge cases** thoroughly

### Frontend Security

- **Sanitize user inputs** before display
- **Validate blockchain data** before using
- **Use proper error boundaries**
- **Never expose private keys** or sensitive data

## 📖 Documentation Standards

### Code Documentation

**Comment complex logic**:
```typescript
// ✅ Good - Explains why, not what
// Use debounced search to avoid excessive API calls
// when user is typing in search input
const debouncedSearch = useDebouncedCallback(
  (searchTerm: string) => {
    performSearch(searchTerm)
  },
  300
)
```

**Update README files** when adding features
**Add JSDoc comments** for public APIs
**Document breaking changes** in pull requests

## 🚀 Pull Request Process

### Before Submitting

- [ ] **All tests pass** (`npm test`)
- [ ] **No linting errors** (`npm run lint`)
- [ ] **TypeScript compiles** without errors
- [ ] **Manual testing** completed
- [ ] **Documentation updated** if needed

### PR Description Template

```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)  
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Include screenshots for UI changes

## Additional Notes
Any additional information or context
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by at least one maintainer
3. **Testing** on development environment
4. **Approval** and merge by maintainer

## 🐛 Reporting Issues

### Bug Reports

Use the bug report template with:
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (browser, OS, etc.)
- **Screenshots or error logs**

### Feature Requests

Include:
- **Problem statement** - what problem does this solve?
- **Proposed solution** - how should it work?
- **Alternatives considered** - what other approaches were considered?
- **Additional context** - mockups, examples, etc.

## 🎉 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **Community discussions** and social media

## 📞 Getting Help

- **GitHub Discussions** for questions and community support
- **GitHub Issues** for bug reports and feature requests
- **Documentation** in `/docs` folders for technical details

---

Thank you for contributing to FHEdback! Your efforts help build a more privacy-preserving future for online surveys. 🔐✨
