# Pre-commit Hooks Setup

This project uses [Husky](https://typicode.github.io/husky/) and
[lint-staged](https://github.com/okonet/lint-staged) to enforce code quality before commits.

## What happens on commit?

### Pre-commit Hook

1. **Code Formatting**: Prettier automatically formats staged files
2. **Linting**: ESLint checks and fixes code quality issues
3. **Type Checking**: TypeScript validates type safety
4. **Quick Tests**: Runs tests to ensure nothing is broken

### Commit Message Hook

- Enforces [Conventional Commits](https://www.conventionalcommits.org/) format
- Format: `type(scope): description`
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`

## Examples of valid commit messages:

```bash
feat: add user authentication system
fix(api): resolve connection timeout issue
docs: update README with setup instructions
refactor(components): simplify button component
test: add unit tests for monitoring service
chore: update dependencies
ci: add pre-commit hooks
```

## How to bypass hooks (not recommended)

If you need to bypass the hooks in an emergency:

```bash
# Bypass pre-commit hook
git commit --no-verify -m "emergency fix"

# Bypass commit-msg hook
git commit --no-verify -m "any message format"
```

## Manual commands

You can run the same checks manually:

```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check

# Run all pre-commit checks manually
npm run pre-commit

# Run complete CI validation
npm run ci:validate
```

## Configuration files

- `.husky/pre-commit` - Pre-commit hook script
- `.husky/commit-msg` - Commit message validation script
- `.prettierrc.json` - Prettier formatting configuration
- `.prettierignore` - Files to ignore during formatting
- `package.json` - lint-staged configuration

## Troubleshooting

### Pre-commit hook fails

1. Check the error output for specific issues
2. Run `npm run format` to fix formatting issues
3. Run `npm run lint:fix` to fix linting issues
4. Run `npm run type-check` to see type errors

### Commit message rejected

- Ensure your commit message follows the conventional commits format
- Use one of the allowed types: feat, fix, docs, style, refactor, test, chore, ci, build, perf
- Keep the description concise and descriptive

### Hook not running

- Ensure Husky is installed: `npm run prepare`
- Check that `.husky/` directory exists and contains executable scripts
- Verify you're in a Git repository

## Disabling hooks for a repository

If you need to disable hooks entirely (not recommended):

```bash
# Disable all hooks
rm -rf .husky
```

## Benefits

✅ **Consistent Code Style**: Prettier ensures uniform formatting  
✅ **Code Quality**: ESLint catches potential issues early  
✅ **Type Safety**: TypeScript validation prevents type errors  
✅ **Clean History**: Conventional commits create readable Git history  
✅ **CI Compatibility**: Same checks run locally and in CI  
✅ **Team Collaboration**: Everyone follows the same standards
