# Quick Reference Guide

## 🚀 Quick Commands

```bash
# Start development
npm run dev

# Create new route
# Just create file: src/routes/path.tsx

# Add new component
# Create: src/components/category/ComponentName.tsx

# Install UI component
npx shadcn@latest add button

# Run tests
npm run test

# Build production
npm run build
```

## 📁 File Naming Conventions

```
✅ Correct:
- src/routes/surveys.create.tsx
- src/components/ui/button.tsx
- src/components/survey-view/SurveyCard.tsx
- src/types/survey.ts
- src/services/api/surveys.ts

❌ Incorrect:
- src/routes/surveys/create.tsx (use dot notation)
- src/components/UI/Button.tsx (lowercase folders)
- src/components/SurveyView/surveyCard.tsx (inconsistent case)
```

## 🎯 Route Patterns

| Pattern | File | URL | Purpose |
|---------|------|-----|---------|
| Index | `routes/index.tsx` | `/` | Home page |
| Simple | `routes/about.tsx` | `/about` | Static page |
| Dynamic | `routes/surveys.$id.tsx` | `/surveys/123` | Dynamic param |
| Nested | `routes/surveys.create.tsx` | `/surveys/create` | Nested route |
| Layout | `routes/surveys.tsx` | `/surveys/*` | Layout for children |
| Protected | `routes/_authenticated.tsx` | - | Auth wrapper |

## 🧩 Component Patterns

### Basic Component
```tsx
interface Props {
  title: string
  children?: React.ReactNode
}

export function ComponentName({ title, children }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}
```

### Form Component
```tsx
const schema = z.object({
  name: z.string().min(1, 'Required'),
})

type FormData = z.infer<typeof schema>

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Data Fetching Component
```tsx
export function DataComponent({ id }: { id: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data.name}</div>
}
```

## 🎨 Neobrutalism Component Examples

### Button Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary</Button>
```

### Card with Shadow
```tsx
<Card className="shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
  <CardHeader>
    <CardTitle>Bold Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Input with Bold Border
```tsx
<Input 
  className="border-2 border-black font-bold"
  placeholder="Bold input"
/>
```

## 🔄 Common Hooks

```tsx
// URL params
const { surveyId } = Route.useParams()

// Navigation
const navigate = useNavigate()
navigate({ to: '/surveys' })

// Form
const { register, handleSubmit } = useForm()

// Data fetching
const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
})

// Mutations
const mutation = useMutation({
  mutationFn: createItem,
  onSuccess: () => {
    // Handle success
  },
})
```

## 📋 TypeScript Patterns

### API Response Types
```tsx
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}
```

### Component Props
```tsx
interface BaseProps {
  className?: string
  children?: React.ReactNode
}

interface ButtonProps extends BaseProps {
  variant?: 'default' | 'outline' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  onClick?: () => void
}
```

### Form Schemas
```tsx
const createSurveySchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().min(10, 'Description too short'),
  questions: z.array(questionSchema).min(1, 'Need at least 1 question'),
})

type CreateSurveyData = z.infer<typeof createSurveySchema>
```

## 🛠️ Development Workflow

### 1. Create New Feature
```bash
# 1. Create types
touch src/types/feature.ts

# 2. Create API service
touch src/services/api/feature.ts

# 3. Create components
mkdir src/components/feature
touch src/components/feature/FeatureCard.tsx

# 4. Create route
touch src/routes/features.tsx

# 5. Add tests
touch src/tests/feature.test.tsx
```

### 2. Debug Flow
```bash
# Check TypeScript errors
npm run type-check

# Check linting
npm run lint

# Run tests
npm run test

# Check build
npm run build
```

### 3. Code Quality
```bash
# Format code
npm run format

# Fix linting issues
npm run lint:fix

# Run all checks
npm run check-all
```

## 🚨 Common Issues & Solutions

### TypeScript Errors
```tsx
// ❌ Problem
const data = await fetch('/api').json() // Type unknown

// ✅ Solution
const data: ApiResponse<Survey[]> = await fetch('/api').json()
```

### Import Errors
```tsx
// ❌ Problem
import { Button } from '../../components/ui/button'

// ✅ Solution
import { Button } from '@/components/ui/button'
```

### Form Validation
```tsx
// ❌ Problem
<input required /> // No validation feedback

// ✅ Solution
<Input {...register('field', { required: 'Field is required' })} />
{errors.field && <span>{errors.field.message}</span>}
```

### Route Navigation
```tsx
// ❌ Problem
window.location.href = '/surveys' // Page reload

// ✅ Solution
const navigate = useNavigate()
navigate({ to: '/surveys' }) // Client-side navigation
```

## 🎯 Best Practices Checklist

### Components
- [ ] Single responsibility
- [ ] TypeScript interfaces defined
- [ ] Error boundaries where needed
- [ ] Loading states handled
- [ ] Responsive design
- [ ] Accessibility (ARIA labels)

### Routes
- [ ] Proper file naming
- [ ] Loading states
- [ ] Error handling
- [ ] Authentication checks
- [ ] SEO meta tags

### Forms
- [ ] Zod schema validation
- [ ] Error messages displayed
- [ ] Loading states during submission
- [ ] Success feedback
- [ ] Accessibility labels

### API Integration
- [ ] Proper error handling
- [ ] Loading states
- [ ] Retry logic
- [ ] TypeScript types
- [ ] Caching strategy

### Performance
- [ ] Components memoized where needed
- [ ] Lazy loading for routes
- [ ] Images optimized
- [ ] Bundle size monitored

## 📚 Quick Links

- [TanStack Router Docs](https://tanstack.com/router)
- [React Hook Form](https://react-hook-form.com/)
- [Neobrutalism Components](https://www.neobrutalism.dev/)
- [Zod Validation](https://zod.dev/)
- [TailwindCSS](https://tailwindcss.com/)
