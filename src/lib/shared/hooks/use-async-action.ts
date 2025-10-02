"use client";

import { useState, useCallback } from "react";

import { handleAsyncOperation } from "../utils/error-handling";

import type { UseAsyncActionOptions, UseAsyncActionReturn } from "../types";

export function useAsyncAction<T>(
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
