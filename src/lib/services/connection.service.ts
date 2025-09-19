import { BaseService } from "./base.service";
import type { ConnectionWithHealthChecks } from "@/lib/repositories";
import type { ConnectionRepository, UserRepository } from "@/lib/repositories";
import { getPlanLimits } from "@/lib/plan-limits";
import { encrypt } from "@/lib/encryption";
import { validateApiConnection } from "@/lib/api-validation";
import type { UserWithPassword } from "@/types/prisma";
import type {
  ConnectionValidationInput,
  ConnectionCreateInput,
} from "@/lib/types";
import { SERVICE_IDENTIFIERS } from "@/lib/di";

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
  private get connectionRepository(): ConnectionRepository {
    return this.resolve<ConnectionRepository>(
      SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY
    );
  }

  private get userRepository(): UserRepository {
    return this.resolve<UserRepository>(SERVICE_IDENTIFIERS.USER_REPOSITORY);
  }

  async getConnections(): Promise<ConnectionData> {
    const user = await this.requireAuth();

    const userData = await this.userRepository.findByIdWithSubscription(
      user.id
    );

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
      await this.connectionRepository.findByUserIdWithHealthChecks(user.id);
    const planLimits = getPlanLimits(userData.subscription);

    const formattedConnections = connections;

    return {
      connections: formattedConnections,
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
      secretKey: input.secretKey,
      apiKey: input.apiKey,
      accountSid: input.accountSid,
      authToken: input.authToken,
      token: input.token,
    };
    const validationResult = await validateApiConnection(validationInput);

    return {
      success: validationResult.success,
      message: validationResult.message,
      data: validationResult.data,
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
      apiKey: encryptedData.apiKey, // Required field
      secretKey: encryptedData.secretKey,
      ...(encryptedData.accountSid && {
        accountSid: encryptedData.accountSid,
      }),
      ...(encryptedData.authToken && { authToken: encryptedData.authToken }),
      ...(encryptedData.token && { token: encryptedData.token }),
    });

    return {
      success: true,
      message: "Connection created successfully",
      connectionId: connection.id,
    };
  }

  async toggleConnectionActive(connectionId: string, isActive: boolean) {
    const user = await this.requireAuth();

    await this.connectionRepository.updateMany(
      {
        id: connectionId,
        userId: user.id, // Ensure user owns the connection
      },
      {
        isActive: !isActive,
      }
    );

    return {
      success: true,
      message: `Connection ${
        !isActive ? "activated" : "deactivated"
      } successfully`,
    };
  }

  async deleteConnection(connectionId: string) {
    const user = await this.requireAuth();

    await this.connectionRepository.deleteMany({
      id: connectionId,
      userId: user.id, // Ensure user owns the connection
    });

    return {
      success: true,
      message: "Connection deleted successfully",
    };
  }
}
