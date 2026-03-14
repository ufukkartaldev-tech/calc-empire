# Code Quality Guidelines

This document outlines the code quality standards and tools used in CalcEmpire.

## Tools and Configuration

### 1. Prettier (Code Formatting)

- **Config**: `.prettierrc`
- **Ignore**: `.prettierignore`
- **Run**: `npm run format`
- **Check**: `npm run format:check`

### 2. ESLint (Code Linting)

- **Config**: `eslint.config.mjs`
- **Run**: `npm run lint`
- **Fix**: `npm run lint:fix`

### 3. Husky (Git Hooks)

Pre-commit hooks automatically run:

- ESLint with auto-fix
- Prettier formatting
- Staged files only (via lint-staged)

Pre-push hooks run:

- Full test suite
- Format check

### 4. SonarQube (Static Code Analysis)

- **Config**: `sonar-project.properties`
- Analyzes code quality, security vulnerabilities, and code smells
- Integrated with CI/CD pipeline
- Quality gate enforced

### 5. Test Coverage

- **Tool**: Vitest with v8 coverage provider
- **Target**: 80% coverage (lines, functions, branches, statements)
- **Run**: `npm run test:coverage`
- **Reports**: HTML, LCOV, JSON, Text

## CI/CD Integration

### GitHub Actions Workflows

#### Code Quality Workflow (`.github/workflows/code-quality.yml`)

Runs on every push and PR:

- ESLint checks
- Prettier format validation
- Unit tests
- E2E tests
- Coverage report generation
- Codecov upload

#### SonarQube Workflow (`.github/workflows/sonarqube.yml`)

Runs on main/develop branches:

- Full code analysis
- Security vulnerability detection
- Code smell identification
- Quality gate validation

## Setup Instructions

### Initial Setup

```bash
# Install dependencies
npm install

# Initialize Husky
npm run prepare
```

### Required Secrets (GitHub)

Add these secrets to your repository:

- `SONAR_TOKEN`: SonarQube authentication token
- `SONAR_HOST_URL`: SonarQube server URL (e.g., https://sonarcloud.io)

### Local Development

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests with coverage
npm run test:coverage
```

## Standards

### Code Style

- Single quotes for strings
- Semicolons required
- 2 spaces indentation
- 100 character line width
- Trailing commas in ES5
- LF line endings

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

### Testing

- Write tests for all new features
- Maintain 80%+ code coverage
- Include unit, integration, and E2E tests
- Test edge cases and error scenarios

## Quality Metrics

### Target Metrics

- **Test Coverage**: ≥80%
- **Code Duplication**: <3%
- **Maintainability Rating**: A
- **Reliability Rating**: A
- **Security Rating**: A
- **Technical Debt Ratio**: <5%

## Troubleshooting

### Husky hooks not running

```bash
npm run prepare
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### SonarQube analysis failing

- Verify SONAR_TOKEN is set correctly
- Check sonar-project.properties configuration
- Ensure test coverage is generated before analysis

### Coverage not meeting threshold

```bash
# Generate detailed coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```
