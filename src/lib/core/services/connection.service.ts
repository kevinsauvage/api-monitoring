import { BaseService } from "./base.service";
import type { ConnectionWithHealthChecks } from "@/lib/core/repositories";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";
import { encrypt } from "@/lib/infrastructure/encryption";
import { validateApiConnection } from "@/lib/shared/utils/api-validation";
import type { UserWithPassword } from "@/lib/shared/types/prisma";
import type {
  ConnectionValidationInput,
  ConnectionCreateInput,
} from "@/lib/shared/types";

export type ConnectionData = {
  connections: ConnectionWithHealthChecks[];
  user: UserWithPassword | null;
  limits: {
    maxConnections: number;
    maxHealthChecks: number;
    currentConnections: number;
    currentHealthChecks: number;
    canCreateConnection: boolean;
    canCreateHealthCheck: boolean;
  };
};

export interface ConnectionValidationResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface ConnectionCreateResult {
  success: boolean;
  message: string;
  connectionId?: string;
}

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
      user: userData as UserWithPassword,
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
    input: ConnectionValidationInput
  ): Promise<ConnectionValidationResult> {
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
    input: ConnectionCreateInput
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

    const encryptedData: Record<string, string> = {};

    if (input["apiKey"]) {
      encryptedData["apiKey"] = encrypt(input["apiKey"]);
    }
    if (input["secretKey"]) {
      encryptedData["secretKey"] = encrypt(input["secretKey"]);
    }
    if (input["accountSid"]) {
      encryptedData["accountSid"] = encrypt(input["accountSid"]);
    }
    if (input["authToken"]) {
      encryptedData["authToken"] = encrypt(input["authToken"]);
    }
    if (input["token"]) {
      encryptedData["token"] = encrypt(input["token"]);
    }

    const connection = await this.connectionRepository.create({
      name: input.name,
      provider: input.provider,
      baseUrl: input.baseUrl,
      user: {
        connect: { id: user.id },
      },
      apiKey: encryptedData["apiKey"], // Required field
      secretKey: encryptedData["secretKey"],
      ...(encryptedData["accountSid"] && {
        accountSid: encryptedData["accountSid"],
      }),
      ...(encryptedData["authToken"] && {
        authToken: encryptedData["authToken"],
      }),
      ...(encryptedData["token"] && { token: encryptedData["token"] }),
    });

    return {
      success: true,
      message: "Connection created successfully",
      connectionId: connection.id,
    };
  }

  async updateConnection(
    connectionId: string,
    data: Partial<{
      name: string;
      baseUrl: string;
      isActive: boolean;
      apiKey: string;
      secretKey: string;
      accountSid: string;
      authToken: string;
      token: string;
    }>
  ) {
    const user = await this.requireAuth();

    // Validate that the connection exists and belongs to the user
    await this.validateResourceOwnership(
      connectionId,
      user.id,
      this.connectionRepository,
      "Connection"
    );

    // Encrypt sensitive data if provided
    const encryptedData: Partial<typeof data> = { ...data };
    if (data.apiKey) {
      encryptedData.apiKey = encrypt(data.apiKey);
    }
    if (data.secretKey) {
      encryptedData.secretKey = encrypt(data.secretKey);
    }
    if (data.accountSid) {
      encryptedData.accountSid = encrypt(data.accountSid);
    }
    if (data.authToken) {
      encryptedData.authToken = encrypt(data.authToken);
    }
    if (data.token) {
      encryptedData.token = encrypt(data.token);
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

    // Validate that the connection exists and belongs to the user
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
