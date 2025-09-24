import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { handleActionError } from "@/lib/shared/errors/error-handler";
import type { ActionResult } from "@/lib/shared/types";

import type { z } from "zod";

/**
 * Create a data action that returns data without redirect
 */
export function createDataAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  serviceMethod: (input: TInput) => Promise<TOutput>,
  revalidatePaths?: string[]
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const validatedInput = schema.parse(input);
      const result = await serviceMethod(validatedInput);

      if (revalidatePaths) {
        revalidatePaths.forEach((path) => revalidatePath(path));
      }

      return {
        success: true,
        data: result,
        message: "Action completed successfully",
      };
    } catch (error) {
      const result = handleActionError(error);
      return {
        success: false,
        message: result.message,
        zodError: result.zodError ?? [],
      };
    }
  };
}

/**
 * Create an action that redirects after success
 */
export function createActionWithRedirect<TInput>(
  schema: z.ZodSchema<TInput>,
  serviceMethod: (input: TInput) => Promise<void>,
  redirectPath: string,
  revalidatePaths?: string[]
) {
  return async (input: TInput): Promise<ActionResult<void>> => {
    try {
      const validatedInput = schema.parse(input);
      await serviceMethod(validatedInput);

      if (revalidatePaths) {
        revalidatePaths.forEach((path) => revalidatePath(path));
      }

      redirect(redirectPath);
    } catch (error) {
      const result = handleActionError(error);
      return {
        success: false,
        message: result.message,
        zodError: result.zodError ?? [],
      };
    }
  };
}

/**
 * Create a delete action
 */
export function createDeleteAction<TInput>(
  schema: z.ZodSchema<TInput>,
  serviceMethod: (input: TInput) => Promise<void>,
  revalidatePaths: string[]
) {
  return async (input: TInput): Promise<ActionResult<void>> => {
    try {
      const validatedInput = schema.parse(input);
      await serviceMethod(validatedInput);

      revalidatePaths.forEach((path) => revalidatePath(path));

      return {
        success: true,
        message: "Successfully deleted",
      };
    } catch (error) {
      const result = handleActionError(error);
      return {
        success: false,
        message: result.message,
        zodError: result.zodError ?? [],
      };
    }
  };
}

/**
 * Create a toggle action for boolean fields
 */
export function createToggleAction<TInput>(
  schema: z.ZodSchema<TInput>,
  serviceMethod: (input: TInput) => Promise<void>,
  revalidatePaths: string[]
) {
  return async (input: TInput): Promise<ActionResult<void>> => {
    try {
      const validatedInput = schema.parse(input);
      await serviceMethod(validatedInput);

      revalidatePaths.forEach((path) => revalidatePath(path));

      return {
        success: true,
        message: "Successfully updated",
      };
    } catch (error) {
      const result = handleActionError(error);
      return {
        success: false,
        message: result.message,
        zodError: result.zodError ?? [],
      };
    }
  };
}

/**
 * Create an update action for modifying existing resources
 */
export function createUpdateAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  serviceMethod: (input: TInput) => Promise<TOutput>,
  revalidatePaths: string[]
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const validatedInput = schema.parse(input);
      const result = await serviceMethod(validatedInput);

      revalidatePaths.forEach((path) => revalidatePath(path));

      return {
        success: true,
        data: result,
        message: "Successfully updated",
      };
    } catch (error) {
      const result = handleActionError(error);
      return {
        success: false,
        message: result.message,
        zodError: result.zodError ?? [],
      };
    }
  };
}

/**
 * Create an action with authentication check
 */
export function createAuthenticatedAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  serviceMethod: (input: TInput, userId: string) => Promise<TOutput>,
  revalidatePaths?: string[]
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const validatedInput = schema.parse(input);

      // Get user session for authentication
      const { getServerSession } = await import("next-auth");
      const { authOptions } = await import("@/lib/infrastructure/auth");
      const { redirect } = await import("next/navigation");

      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        redirect("/auth/signin");
      }

      const result = await serviceMethod(validatedInput, session!.user.id);

      if (revalidatePaths) {
        revalidatePaths.forEach((path) => revalidatePath(path));
      }

      return {
        success: true,
        data: result,
        message: "Action completed successfully",
      };
    } catch (error) {
      const result = handleActionError(error);
      return {
        success: false,
        message: result.message,
        zodError: result.zodError ?? [],
      };
    }
  };
}
