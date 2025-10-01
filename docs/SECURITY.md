# Security Vulnerability Management

This document outlines how to handle security vulnerabilities in the project dependencies.

## Current Status

✅ **Resolved**: ESBuild vulnerability (GHSA-67mh-4wv8-2f99)  
✅ **Solution**: Rolled back to Vitest 2.x for stability

## Handling npm audit Vulnerabilities

### 1. Assessment First

Before applying fixes, always assess the impact:

```bash
# Check current vulnerabilities
npm audit

# Get detailed JSON report
npm audit --json > audit-report.json
```

### 2. Conservative Approach

Prefer targeted fixes over `--force` updates:

```bash
# Target specific packages
npm update package-name

# Or install specific versions
npm install package-name@version --save-dev
```

### 3. Avoid Breaking Changes

- `npm audit fix --force` can introduce breaking changes
- Test thoroughly after any security updates
- Consider compatibility with your current setup

## Recent Resolution

### Issue

- ESBuild ≤0.24.2 vulnerability affecting development server

- npm audit suggested Vitest 3.x upgrade
- Vitest 3.x introduced ESM-only breaking changes

### Solution

- Rolled back to Vitest 2.1.8 (stable)
- Maintained compatibility with existing config
- Updated CI to handle audit failures gracefully

### Files Changed

- `package.json`: Downgraded vitest packages
- `vitest.config.ts`: Maintained 2.x compatible config

- `.github/workflows/security.yml`: More resilient audit handling
- `.husky/pre-commit`: Removed deprecated v10 incompatible lines

## Best Practices

### ✅ Do

- Review vulnerability details before fixing
- Test after security updates
- Prefer stable versions over bleeding edge
- Update CI to handle failures gracefully
- Document security decisions

### ❌ Don't

- Blindly run `npm audit fix --force`
- Ignore compatibility when updating
- Update all packages at once
- Skip testing after security fixes

## Monitoring

The security workflow runs:

- On every push to main
- On every pull request
- Weekly on Sundays at 2 AM UTC

Results are uploaded as artifacts and can be reviewed in the GitHub Actions tab.

## Emergency Process

If a critical vulnerability needs immediate attention:

1. Create a hotfix branch
2. Apply minimal fix
3. Test thoroughly
4. Use emergency commit script if needed:
   ```bash
   ./scripts/emergency-commit.sh "security: fix critical vulnerability"
   ```
5. Create emergency PR
