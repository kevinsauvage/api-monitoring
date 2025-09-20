"use client";

import { useState, useCallback } from "react";
import { handleAsyncOperation } from "../utils/error-handling";

interface UseAsyncActionOptions<T> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncActionReturn<T> {
  execute: (
    operation: () => Promise<T>
  ) => Promise<{ success: boolean; data?: T; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

export function useAsyncAction<T = unknown>(
  options: UseAsyncActionOptions<T> = {}
): UseAsyncActionReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>) => {
      setIsLoading(true);
      setError(null);

      const result = await handleAsyncOperation(operation, {
        ...options,
        onSuccess: (data) => {
          options.onSuccess?.(data);
          setError(null);
        },
        onError: (err) => {
          options.onError?.(err);
          setError(err.message);
        },
      });

      setIsLoading(false);
      return result;
    },
    [options]
  );

  return { execute, isLoading, error };
}
