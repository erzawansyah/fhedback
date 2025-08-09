# Contributing to FhedBack

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone <your-fork-url>
   cd fhedback_vite
   ```

2. **Environment Setup**
   ```bash
   ./scripts/setup.sh
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` types
- Use type imports where possible

### React Components
- Use functional components with hooks
- Implement proper prop types
- Use React.memo for performance optimization
- Follow the single responsibility principle

### Styling
- Use TailwindCSS utility classes
- Create reusable component variants with CVA
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

### File Organization
- Group related files in folders
- Use index.ts files for clean exports
- Follow the established folder structure
- Use descriptive file names

## Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(survey): add FHE encryption for responses
fix(wallet): resolve connection timeout issue
docs(readme): update setup instructions
```

## Testing

### Unit Tests
- Test individual components and functions
- Use React Testing Library for component tests
- Mock external dependencies
- Aim for 80%+ code coverage

### Integration Tests
- Test component interactions
- Test API integrations
- Test blockchain interactions
- Use realistic test data

### E2E Tests
- Test complete user workflows
- Test critical paths
- Test across different browsers
- Use Playwright or Cypress

## Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code standards
   - Add tests
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Submit PR**
   - Use descriptive title
   - Include motivation and context
   - Link related issues
   - Request review

## Code Review Guidelines

### For Authors
- Keep PRs small and focused
- Provide context and screenshots
- Respond to feedback promptly
- Update based on review comments

### For Reviewers
- Review code, not the person
- Be constructive and helpful
- Test the changes locally
- Approve when ready

## Getting Help

- Check existing documentation
- Search existing issues
- Ask questions in discussions
- Join our Discord server
