# Testing Documentation

This directory contains comprehensive tests for the `src/lib/core` module using Vitest.

## Test Structure

```
src/test/
├── setup.ts                    # Global test setup
├── mocks/                      # Mock implementations
│   ├── prisma.mock.ts         # Prisma client mocks
│   ├── auth.mock.ts           # NextAuth mocks
│   ├── encryption.mock.ts     # Encryption mocks
│   └── logger.mock.ts         # Logger mocks
├── utils/                      # Test utilities
│   ├── test-data.ts           # Test data factories
│   ├── test-helpers.ts        # Test helper functions
│   └── test-database.ts       # Test database utilities
├── integration/                # Integration tests
│   └── __tests__/
│       └── health-check-integration.test.ts
└── e2e/                       # End-to-end tests
    └── __tests__/
        └── api-endpoints.test.ts
```

## Test Categories

### 1. Unit Tests

- **Repository Tests**: Test data access layer
- **Service Tests**: Test business logic layer
- **Serializer Tests**: Test data transformation
- **Monitoring Tests**: Test health check execution

### 2. Integration Tests

- **Service Integration**: Test service interactions
- **Database Integration**: Test with real database
- **Authentication Integration**: Test auth flows

### 3. End-to-End Tests

- **API Endpoint Tests**: Test complete request/response cycles
- **Workflow Tests**: Test complete user workflows

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Test Configuration

The tests are configured in `vitest.config.ts` with:

- **Environment**: jsdom for DOM testing
- **Coverage**: v8 provider with 80% thresholds
- **Setup**: Global test setup in `src/test/setup.ts`
- **Aliases**: Path mapping for imports

## Mock Strategy

### Prisma Mocks

- Mock all Prisma client methods
- Provide realistic return values
- Support transaction mocking

### Authentication Mocks

- Mock NextAuth session
- Support different user states
- Handle authentication errors

### External Service Mocks

- Mock HTTP requests (axios)
- Mock encryption/decryption
- Mock logging functions

## Test Data Factories

Use the test data factories in `test-data.ts` to create consistent test data:

```typescript
import { createTestUser, createTestConnection } from "@/test/utils/test-data";

const user = createTestUser({ name: "Custom Name" });
const connection = createTestConnection({ provider: "REST" });
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` to reset mocks
- Clean up test data after tests

### 2. Descriptive Test Names

```typescript
describe("HealthCheckService", () => {
  describe("createHealthCheck", () => {
    it("should create health check successfully", () => {
      // test implementation
    });

    it("should handle validation errors", () => {
      // test implementation
    });
  });
});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it("should create health check successfully", async () => {
  // Arrange
  const healthCheckData = { endpoint: "/health" };
  mockRepository.create.mockResolvedValue(mockHealthCheck);

  // Act
  const result = await service.createHealthCheck(healthCheckData);

  // Assert
  expect(result.success).toBe(true);
  expect(mockRepository.create).toHaveBeenCalledWith(healthCheckData);
});
```

### 4. Mock Verification

```typescript
expect(mockRepository.create).toHaveBeenCalledWith(
  expect.objectContaining({
    endpoint: "/health",
    method: "GET",
  })
);
```

## Coverage Goals

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Debugging Tests

### 1. Use `console.log` for debugging

```typescript
it("should debug test", () => {
  console.log("Debug info:", result);
  expect(result).toBeDefined();
});
```

### 2. Use `describe.only` or `it.only` to run specific tests

```typescript
describe.only("Specific Test Suite", () => {
  it.only("should run only this test", () => {
    // test implementation
  });
});
```

### 3. Use `--reporter=verbose` for detailed output

```bash
npm run test -- --reporter=verbose
```

## Continuous Integration

Tests are configured to run in CI/CD pipelines with:

- Database setup and teardown
- Environment variable configuration
- Coverage reporting
- Test result reporting

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are imported before the module being tested
2. **Async test failures**: Use `await` for async operations
3. **Database connection issues**: Check test database configuration
4. **Import errors**: Verify path aliases in `vitest.config.ts`

### Debug Commands

```bash
# Run specific test file
npm run test src/lib/core/repositories/__tests__/connection.repository.test.ts

# Run tests with debug output
npm run test -- --reporter=verbose

# Run tests in specific directory
npm run test src/lib/core/repositories/
```


