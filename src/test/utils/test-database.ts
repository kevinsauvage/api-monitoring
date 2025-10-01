import { PrismaClient, Subscription } from "@prisma/client";

// Test database configuration
export const testDatabase = {
  url:
    process.env.TEST_DATABASE_URL ||
    "postgresql://test:test@localhost:5432/api_monitoring_test",
};

// Test database client
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabase.url,
    },
  },
});

// Test database utilities
export const testDatabaseUtils = {
  async cleanup() {
    // Clean up test data in reverse order of dependencies
    await testPrisma.checkResult.deleteMany();
    await testPrisma.healthCheck.deleteMany();
    await testPrisma.apiConnection.deleteMany();
    await testPrisma.user.deleteMany();
  },

  async seed() {
    // Seed test data
    const testUser = await testPrisma.user.create({
      data: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        subscription: Subscription.HOBBY,
      },
    });

    const testConnection = await testPrisma.apiConnection.create({
      data: {
        id: "test-connection-id",
        name: "Test Connection",
        provider: "REST",
        baseUrl: "https://api.example.com",
        apiKey: "encrypted-api-key",
        isActive: true,
        userId: testUser.id,
      },
    });

    const testHealthCheck = await testPrisma.healthCheck.create({
      data: {
        id: "test-health-check-id",
        apiConnectionId: testConnection.id,
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        interval: 300,
        isActive: true,
      },
    });

    return {
      user: testUser,
      connection: testConnection,
      healthCheck: testHealthCheck,
    };
  },

  async disconnect() {
    await testPrisma.$disconnect();
  },
};
