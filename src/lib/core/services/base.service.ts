import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth";
import {
  UnauthorizedError,
  handleError,
  withErrorHandling,
  withSyncErrorHandling,
  logError,
} from "@/lib/shared/errors";
import { container } from "@/lib/infrastructure/di";
import { log } from "@/lib/shared/utils/logger";
import type { ServiceIdentifier } from "@/lib/infrastructure/di";

export abstract class BaseService {
  protected resolve<T>(identifier: ServiceIdentifier): T {
    return container.resolve<T>(identifier);
  }

  protected async getCurrentUser() {
    try {
      const session = await getServerSession(authOptions);
      return session?.user;
    } catch (error) {
      logError(error as Error, { context: "getCurrentUser" });
      return null;
    }
  }

  protected async requireAuth() {
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) {
        throw new UnauthorizedError("Authentication required");
      }
      return user;
    } catch (error) {
      log.error("Authentication error", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new UnauthorizedError("Authentication required");
    }
  }

  protected handleServiceError(error: unknown, context: string): never {
    logError(error as Error, { context });
    throw handleError(error);
  }

  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    return withErrorHandling(operation, context);
  }

  protected executeSyncWithErrorHandling<T>(
    operation: () => T,
    context: string
  ): T {
    return withSyncErrorHandling(operation, context);
  }

  protected validateOwnership(
    resourceUserId: string,
    currentUserId: string
  ): void {
    if (resourceUserId !== currentUserId) {
      throw new UnauthorizedError(
        "You don't have permission to access this resource"
      );
    }
  }
}
