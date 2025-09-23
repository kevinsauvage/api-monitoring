import type z from "zod";
import type { Prisma, User } from "@prisma/client";
import { getPlanLimits, validateApiConnection } from "@/lib/shared/utils";
import { encrypt } from "@/lib/infrastructure/encryption";
import { BaseService } from "./base.service";
import type { connectionSchemas } from "@/lib/shared/schemas";
import type { ConnectionData, ConnectionCreateResult } from "@/lib/core/types";

export class ConnectionService extends BaseService {
  async getConnections(): Promise<ConnectionData> {
    const user = await this.requireAuth();
    return this.getConnectionsForUser(user.id);
  }

  async getConnectionsForUser(userId: string): Promise<ConnectionData> {
    const userData = await this.userRepository.findByIdWithSubscription(userId);

    if (!userData) {
      return {
        connections: [],
        user: null,
        limits: {
          maxConnections: 0,
          maxHealthChecks: 0,
          currentConnections: 0,
          currentHealthChecks: 0,
          canCreateConnection: false,
          canCreateHealthCheck: false,
        },
      };
    }

    const connections =
      await this.connectionRepository.findByUserIdWithHealthChecks(userId);
    const planLimits = getPlanLimits(userData.subscription);

    return {
      connections,
      user: userData as User,
      limits: {
        maxConnections: planLimits.maxConnections,
        maxHealthChecks: planLimits.maxHealthChecks,
        currentConnections: connections.length,
        currentHealthChecks: connections.reduce(
          (acc, c) => acc + c.healthChecks.length,
          0
        ),
        canCreateConnection: connections.length < planLimits.maxConnections,
        canCreateHealthCheck:
          connections.reduce((acc, c) => acc + c.healthChecks.length, 0) <
          planLimits.maxHealthChecks,
      },
    };
  }

  async getConnectionById(connectionId: string) {
    const user = await this.requireAuth();

    const connection = await this.connectionRepository.findByIdWithHealthChecks(
      connectionId,
      user.id
    );

    if (!connection) {
      return null;
    }

    return connection;
  }

  async validateConnection(
    input: z.infer<typeof connectionSchemas.validation>
  ): Promise<{
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
  }> {
    await this.requireAuth();

    const validationInput = {
      ...input,
      secretKey: input.secretKey ?? "",
      apiKey: input.apiKey ?? "",
      accountSid: input.accountSid ?? "",
      authToken: input.authToken ?? "",
      token: input.token ?? "",
    };
    const validationResult = await validateApiConnection(validationInput);

    return {
      success: validationResult.success,
      message: validationResult.message,
      data: validationResult.data ?? {},
    };
  }

  async createConnection(
    input: Omit<Prisma.ApiConnectionCreateInput, "user">
  ): Promise<ConnectionCreateResult> {
    const user = await this.requireAuth();

    const userData = await this.userRepository.findByIdWithSubscription(
      user.id
    );

    if (!userData) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const planLimits = getPlanLimits(userData.subscription);
    const currentConnections = await this.connectionRepository.countByUserId(
      user.id
    );

    if (currentConnections >= planLimits.maxConnections) {
      return {
        success: false,
        message: `Connection limit reached. You can create up to ${planLimits.maxConnections} connections on the ${planLimits.name} plan.`,
      };
    }

    const encryptedData: Partial<Prisma.ApiConnectionCreateInput> = {};

    if (input.apiKey) {
      encryptedData.apiKey = encrypt(input.apiKey);
    }
    if (input.secretKey) {
      encryptedData.secretKey = encrypt(input.secretKey);
    }
    if (input.accountSid) {
      encryptedData.accountSid = encrypt(input.accountSid);
    }
    if (input.authToken) {
      encryptedData.authToken = encrypt(input.authToken);
    }
    if (input.token) {
      encryptedData.token = encrypt(input.token);
    }

    const connection = await this.connectionRepository.create({
      name: input.name,
      provider: input.provider,
      baseUrl: input.baseUrl,
      user: {
        connect: { id: user.id },
      },
      apiKey: encryptedData.apiKey ?? "",
      secretKey: encryptedData.secretKey,
      ...(encryptedData.accountSid && {
        accountSid: encryptedData.accountSid,
      }),
      ...(encryptedData.authToken && {
        authToken: encryptedData.authToken,
      }),
      ...(encryptedData.token && { token: encryptedData.token }),
    });

    return {
      success: true,
      message: "Connection created successfully",
      connectionId: connection.id,
    };
  }

  async updateConnection(
    connectionId: string,
    data: Partial<Prisma.ApiConnectionUpdateInput>
  ) {
    const user = await this.requireAuth();

    await this.validateResourceOwnership(
      connectionId,
      user.id,
      this.connectionRepository,
      "Connection"
    );

    // Encrypt sensitive data if provided
    const encryptedData: Partial<Prisma.ApiConnectionUpdateInput> = { ...data };
    if (data.apiKey) {
      encryptedData.apiKey = encrypt(data.apiKey as string);
    }
    if (data.secretKey) {
      encryptedData.secretKey = encrypt(data.secretKey as string);
    }
    if (data.accountSid) {
      encryptedData.accountSid = encrypt(data.accountSid as string);
    }
    if (data.authToken) {
      encryptedData.authToken = encrypt(data.authToken as string);
    }
    if (data.token) {
      encryptedData.token = encrypt(data.token as string);
    }

    await this.connectionRepository.updateMany(
      {
        id: connectionId,
        userId: user.id,
      },
      encryptedData
    );

    return this.createServiceResponse(
      true,
      undefined,
      "Connection updated successfully"
    );
  }

  async toggleConnectionActive(connectionId: string, isActive: boolean) {
    return this.updateConnection(connectionId, { isActive: !isActive });
  }

  async deleteConnection(connectionId: string) {
    const user = await this.requireAuth();

    await this.validateResourceOwnership(
      connectionId,
      user.id,
      this.connectionRepository,
      "Connection"
    );

    await this.connectionRepository.deleteMany({
      id: connectionId,
      userId: user.id,
    });

    return this.createServiceResponse(
      true,
      undefined,
      "Connection deleted successfully"
    );
  }
}
