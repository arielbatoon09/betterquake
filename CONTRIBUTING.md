# Contributing to BetterQuake 🤝

First off, thank you for considering contributing to BetterQuake! It's people like you that make BetterQuake such a great tool for earthquake monitoring in the Philippines.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- **Be respectful** and inclusive
- **Be collaborative** and helpful
- **Focus on what is best** for the community
- **Show empathy** towards other community members

## 🤔 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Node version: [e.g. 18.17.0]

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** and description
- **Specific examples** to demonstrate the feature
- **Explain why** this enhancement would be useful
- **List similar features** in other applications (if applicable)

### Your First Code Contribution 🎉

Unsure where to begin? Look for issues labeled:

- `good-first-issue` - Issues that are good for newcomers
- `help-wanted` - Issues that need assistance
- `documentation` - Documentation improvements

## 🛠️ Development Setup

### Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun
- Git

### Local Development

1. **Fork the repository** on GitHub

2. **Clone your fork:**
```bash
git clone https://github.com/YOUR-USERNAME/better-quake.git
cd better-quake
```

3. **Add upstream remote:**
```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/better-quake.git
```

4. **Install dependencies:**
```bash
npm install
```

5. **Create a branch:**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

6. **Run the development server:**
```bash
npm run dev
```

7. **Make your changes** and test thoroughly

8. **Run linter:**
```bash
npm run lint
```

### Project Structure

```
better-quake/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   └── *.tsx             # Custom components
├── lib/                   # Utility functions
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Helper functions
│   └── *.ts              # Other utilities
└── public/               # Static files
```

## 🔄 Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** if you're adding new features
3. **Ensure all tests pass** and code is linted
4. **Update the README.md** with details of changes if needed
5. **Follow the PR template** when creating your pull request

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
```

## 📝 Coding Standards

### TypeScript/React

- Use **TypeScript** for all new files
- Use **functional components** with hooks
- Follow **React best practices**
- Use **proper typing** - avoid `any` when possible

### Code Style

```typescript
// ✅ Good
interface EarthquakeProps {
  magnitude: number;
  location: string;
}

export function EarthquakeCard({ magnitude, location }: EarthquakeProps) {
  return (
    <div className="earthquake-card">
      <p>{magnitude}</p>
      <p>{location}</p>
    </div>
  );
}

// ❌ Bad
export function EarthquakeCard(props: any) {
  return <div>{props.magnitude}</div>;
}
```

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `EarthquakeList.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `earthquake-utils.ts`)
- **Types**: `types.ts` or co-located with components

### CSS/Styling

- Use **TailwindCSS** utilities
- Use **ShadCN UI** components when possible
- Keep custom styles minimal
- Use CSS variables for theming

## 💬 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(filters): add magnitude range filter

Add ability to filter earthquakes by magnitude range
with min and max inputs for better precision.

Closes #123
```

```bash
fix(api): correct date parsing for PHIVOLCS format

The date parser was failing on dates with special characters.
Updated regex to handle all date formats from PHIVOLCS.

Fixes #456
```

```bash
docs(readme): update installation instructions

Added troubleshooting section and clarified
Node.js version requirements.
```

## 🧪 Testing

Before submitting a PR:

1. **Test your changes** manually in the browser
2. **Test different screen sizes** (responsive design)
3. **Test edge cases** and error scenarios
4. **Check console** for errors or warnings
5. **Verify API rate limits** aren't exceeded

## 📚 Documentation

- Keep **README.md** up to date
- Add **JSDoc comments** to functions
- Update **API documentation** if endpoints change
- Include **usage examples** for new features

## ❓ Questions?

Feel free to:
- Open an issue for discussion
- Join our community chat (if available)
- Ask questions in your PR

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

Happy coding! 🚀

