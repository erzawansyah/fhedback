# FhedBack Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- VS Code (recommended)

### Initial Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# 3. Start development server
npm run dev
```

## 📁 Project Structure

```
fhedback_vite/
├── 📁 public/                 # Static assets
├── 📁 src/
│   ├── 📁 assets/            # Images, icons, etc.
│   ├── 📁 components/        # React components
│   │   ├── ui/             # Reusable UI components (Neobrutalism)
│   │   ├── layout/         # Layout components
│   │   └── forms/          # Form components
│   ├── 📁 context/          # React Context providers
│   ├── 📁 hooks/            # Custom React hooks
│   ├── 📁 routes/           # Route components (TanStack Router)
│   ├── 📁 services/         # External services
│   │   ├── api/            # API calls
│   │   └── blockchain/     # Blockchain integration
│   ├── 📁 stores/           # State management
│   ├── 📁 types/            # TypeScript definitions
│   ├── 📁 utils/            # Utility functions
│   └── 📁 constants/        # Application constants
├── 📁 tests/                # Test files
├── 📁 docs/                 # Documentation
└── 📁 scripts/              # Build and utility scripts
```

## 🛣️ Creating New Routes/Pages

### File-Based Routing with TanStack Router

FhedBack uses TanStack Router's file-based routing system. Routes are automatically generated based on your file structure in the `src/routes/` directory.

#### 1. Basic Route Creation

**Create a simple page:**
```bash
# Create src/routes/dashboard.tsx
```

```tsx
// src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  )
}
```

**Result:** Creates route at `/dashboard`

#### 2. Index Routes

**Create a root index page:**
```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-4xl font-bold text-center pt-20">
        Welcome to FhedBack
      </h1>
    </div>
  )
}
```

#### 3. Nested Routes

**Using directory structure:**
```
src/routes/
├── surveys/
│   ├── index.tsx          # /surveys
│   ├── $surveyId.tsx      # /surveys/:surveyId
│   └── create.tsx         # /surveys/create
```

**Using dot notation (flat structure):**
```
src/routes/
├── surveys.tsx            # /surveys (layout)
├── surveys.index.tsx      # /surveys (exact)
├── surveys.$surveyId.tsx  # /surveys/:surveyId
└── surveys.create.tsx     # /surveys/create
```

#### 4. Dynamic Routes

**Create dynamic route with parameters:**
```tsx
// src/routes/surveys.$surveyId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/surveys/$surveyId')({
  component: SurveyDetail,
  loader: async ({ params }) => {
    // Fetch survey data
    const survey = await fetchSurvey(params.surveyId)
    return { survey }
  },
})

function SurveyDetail() {
  const { survey } = Route.useLoaderData()
  const { surveyId } = Route.useParams()
  
  return (
    <div>
      <h1>Survey: {survey.title}</h1>
      <p>ID: {surveyId}</p>
    </div>
  )
}
```

#### 5. Layout Routes

**Create layout for nested routes:**
```tsx
// src/routes/surveys.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/surveys')({
  component: SurveysLayout,
})

function SurveysLayout() {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-100 p-4">
        <nav>
          <Link to="/surveys">All Surveys</Link>
          <Link to="/surveys/create">Create Survey</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  )
}
```

#### 6. Protected Routes

**Add authentication to routes:**
```tsx
// src/routes/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
  beforeLoad: async ({ context }) => {
    // Check authentication
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/dashboard',
        },
      })
    }
  },
})
```

## 🎨 Creating UI Components (Neobrutalism)

FhedBack uses Neobrutalism UI components for a bold, modern design aesthetic.

### Setup Neobrutalism Components

#### 1. Install Shadcn/UI (if not already done)
```bash
npx shadcn@latest init
```

#### 2. Add Neobrutalism Styling
Replace your `src/index.css` with Neobrutalism styling:
```css
/* Copy styling from https://www.neobrutalism.dev/styling */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... other CSS variables */
  }
}
```

#### 3. Install Components via CLI
```bash
# Install specific components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

#### 4. Replace with Neobrutalism Variants

**Example Button Component:**
```tsx
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-bold uppercase tracking-wide border-2 border-black dark:border-white transition-all duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none",
        destructive: "bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        outline: "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Component Usage Examples

**Using Neobrutalism components:**
```tsx
// src/routes/example.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function ExamplePage() {
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Neobrutalism Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Enter your name"
            className="font-bold"
          />
          <Button className="w-full">
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 📝 Creating Forms with React Hook Form + Zod

### Form Setup Pattern

**1. Define Form Schema:**
```tsx
// src/types/survey.ts
import { z } from 'zod'

export const createSurveySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'multiple-choice', 'rating']),
    title: z.string().min(1, 'Question title is required'),
    options: z.array(z.string()).optional(),
  })).min(1, 'At least one question is required'),
  isPrivate: z.boolean().default(false),
})

export type CreateSurveyData = z.infer<typeof createSurveySchema>
```

**2. Create Form Component:**
```tsx
// src/components/forms/CreateSurveyForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSurveySchema, type CreateSurveyData } from '@/types/survey'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export function CreateSurveyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateSurveyData>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [],
      isPrivate: false,
    },
  })

  const onSubmit = async (data: CreateSurveyData) => {
    try {
      // Handle form submission
      await createSurvey(data)
      // Navigate to success page
    } catch (error) {
      console.error('Failed to create survey:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="font-bold">
          Survey Title
        </label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter survey title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="font-bold">
          Description
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe your survey"
          rows={4}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPrivate"
          {...register('isPrivate')}
        />
        <label htmlFor="isPrivate" className="font-bold">
          Private Survey
        </label>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creating...' : 'Create Survey'}
      </Button>
    </form>
  )
}
```

**3. Use Form in Route:**
```tsx
// src/routes/surveys.create.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateSurveyForm } from '@/components/forms/CreateSurveyForm'

export const Route = createFileRoute('/surveys/create')({
  component: CreateSurvey,
})

function CreateSurvey() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Survey</h1>
      <CreateSurveyForm />
    </div>
  )
}
```

## 🔧 Development Workflow

### Adding New Features

1. **Create types first:**
   ```tsx
   // src/types/feature.ts
   export interface NewFeature {
     id: string
     name: string
   }
   ```

2. **Create services:**
   ```tsx
   // src/services/api/feature.ts
   export async function createFeature(data: CreateFeatureData) {
     // API call implementation
   }
   ```

3. **Create components:**
   ```tsx
   // src/components/feature/FeatureCard.tsx
   export function FeatureCard({ feature }: { feature: NewFeature }) {
     // Component implementation
   }
   ```

4. **Create routes:**
   ```tsx
   // src/routes/features.tsx
   // Route implementation with file-based routing
   ```

5. **Add tests:**
   ```tsx
   // src/tests/unit/FeatureCard.test.tsx
   // Component tests
   ```

### Code Organization Tips

- **Components**: Group by feature, then by type (ui, forms, layout)
- **Services**: Separate by domain (api, blockchain, storage)
- **Types**: Mirror your data structure and API contracts
- **Utils**: Keep pure functions, avoid side effects
- **Constants**: Use for configuration and static values

### Import Path Aliases

Use configured aliases for cleaner imports:
```tsx
// ✅ Good
import { Button } from '@/components/ui/button'
import { createSurvey } from '@/services/api/surveys'
import { SurveyType } from '@/types/survey'

// ❌ Avoid
import { Button } from '../../components/ui/button'
import { createSurvey } from '../../../services/api/surveys'
```

## 🧪 Testing Guidelines

### Unit Tests
```tsx
// src/tests/unit/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
```

### Integration Tests
```tsx
// src/tests/integration/CreateSurvey.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateSurveyForm } from '@/components/forms/CreateSurveyForm'

describe('CreateSurveyForm', () => {
  it('creates survey with valid data', async () => {
    render(<CreateSurveyForm />)
    
    fireEvent.change(screen.getByLabelText('Survey Title'), {
      target: { value: 'Test Survey' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Create Survey' }))
    
    await waitFor(() => {
      expect(mockCreateSurvey).toHaveBeenCalledWith({
        title: 'Test Survey',
        // ... other fields
      })
    })
  })
})
```

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript type checking

# Testing
npm run test            # Run tests
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests

# Utilities
npm run clean           # Clean build artifacts
npm run setup           # Run development setup script
```

## 🛠️ Technology Stack

### Frontend Core
- **React 19** - UI library with concurrent features
- **TypeScript** - Type safety and developer experience
- **Vite 7** - Fast build tool and dev server
- **TailwindCSS v4** - Utility-first styling

### Routing & State
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management (optional)

### UI & Forms
- **Radix UI** - Headless component primitives
- **Neobrutalism Components** - Bold, modern design system
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### Blockchain & Privacy
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum interface
- **Ethers.js** - Ethereum library
- **Zama FHE Relayer SDK** - Homomorphic encryption
- **RainbowKit** - Wallet connection UI

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **TypeScript** - Static type checking

## 🔄 Common Patterns

### Error Boundaries
```tsx
// src/components/layout/ErrorBoundary.tsx
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent
      fallback={<div>Something went wrong!</div>}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
```

### Loading States
```tsx
// Using TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['surveys', surveyId],
  queryFn: () => fetchSurvey(surveyId),
})

if (isLoading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>
```

### Protected Routes Pattern
```tsx
// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  component: AuthLayout,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
})
```

This guide provides the foundation for developing with FhedBack. Refer to the individual technology documentation for advanced patterns and best practices.
