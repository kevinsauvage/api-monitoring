# Continuous Integration (CI) Setup

This project uses GitHub Actions for continuous integration and automated quality checks.

## Workflows

### CI Pipeline (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**

1. **Lint & Type Check**
   - ESLint code quality checks
   - TypeScript type validation
2. **Tests**
   - Unit test execution with Vitest
   - Test coverage reporting
   - Coverage upload to Codecov
3. **Build**
   - Application build verification
   - Runs only after lint and test jobs pass

### Security Pipeline (`security.yml`)

Runs on push/PR to `main` and weekly on schedule.

**Jobs:**

1. **Security Audit**
   - npm audit for known vulnerabilities
   - Dependency review for PRs

## Local Validation

Before pushing changes, you can run the same checks locally:

```bash
# Run all CI checks locally
npm run ci:validate

# Or run individual checks
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run test:run      # Tests
npm run test:coverage # Tests with coverage
npm run build         # Build verification
```

## Required Environment Variables for Build

The CI pipeline requires these environment variables for the build step:

- `NEXTAUTH_SECRET`: Authentication secret (mocked in CI)
- `NEXTAUTH_URL`: Application URL (mocked in CI)
- `PRISMA_DATABASE_URL`: Database connection string (mocked in CI)
- `ENCRYPTION_KEY`: Encryption key for sensitive data (mocked in CI)

## Status Badges

The README includes status badges that show the current state of:

- CI Pipeline:
  [![CI](https://github.com/kevinsauvage/api-monitoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kevinsauvage/api-monitoring/actions/workflows/ci.yml)
- Security:
  [![Security](https://github.com/kevinsauvage/api-monitoring/actions/workflows/security.yml/badge.svg)](https://github.com/kevinsauvage/api-monitoring/actions/workflows/security.yml)

## Troubleshooting

### Common Issues

1. **Lint failures**: Run `npm run lint:fix` to auto-fix many issues
2. **Type errors**: Check TypeScript configuration in `tsconfig.json`
3. **Test failures**: Run `npm run test:watch` for interactive debugging
4. **Build failures**: Ensure all environment variables are properly mocked

### Updating Node.js Version

To update the Node.js version used in CI:

1. Update the `NODE_VERSION` environment variable in both workflow files
2. Test locally with the new version
3. Update any version-specific dependencies if needed

## Contributing

All pull requests must pass CI checks before merging. The PR template includes a checklist to ensure
all quality gates are met.
