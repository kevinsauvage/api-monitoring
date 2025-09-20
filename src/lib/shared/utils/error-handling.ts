import { toast } from "sonner";
import { log } from "./logger";

export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    onError?: (error: Error) => void;
    onSuccess?: (result: T) => void;
  } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await operation();

    if (options.successMessage) {
      toast.success(options.successMessage);
    }

    if (options.onSuccess) {
      options.onSuccess(result);
    }

    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const displayMessage = options.errorMessage;

    log.error("Async operation failed:", errorMessage);
    toast.error(displayMessage);

    if (options.onError) {
      options.onError(error instanceof Error ? error : new Error(errorMessage));
    }

    return { success: false, error: errorMessage };
  }
}
