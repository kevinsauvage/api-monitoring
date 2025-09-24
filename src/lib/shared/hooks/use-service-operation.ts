/**
 * Modern hook for handling service operations with better error handling
 */

import { useState, useCallback } from "react";

import { toast } from "sonner";

import type { ApiResult } from "../types/api-results";

interface UseServiceOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseServiceOperationReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (operation: () => Promise<ApiResult<T>>) => Promise<void>;
  reset: () => void;
}

export function useServiceOperation<T = unknown>(
  options: UseServiceOperationOptions<T> = {}
): UseServiceOperationReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<ApiResult<T>>) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();

        if (result.success) {
          setData(result.data ?? null);
          if (options.onSuccess && result.data) {
            options.onSuccess(result.data);
          }
          if (options.successMessage ?? result.message) {
            toast.success(
              options.successMessage ??
                result.message ??
                "Operation completed successfully"
            );
          }
        } else {
          const errorMessage = result.error ?? "Operation failed";
          setError(errorMessage);
          if (options.onError) {
            options.onError(errorMessage);
          }
          if (options.errorMessage ?? result.error) {
            toast.error(
              options.errorMessage ?? result.error ?? "Operation failed"
            );
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        if (options.onError) {
          options.onError(errorMessage);
        }
        toast.error(options.errorMessage ?? errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}
