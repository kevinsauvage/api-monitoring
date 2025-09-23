// Hook-related types

export interface UseAsyncActionOptions<T> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
}

export interface UseAsyncActionReturn<T> {
  execute: (
    operation: () => Promise<T>
  ) => Promise<{ success: boolean; data?: T; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

export interface UseConfirmationDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export interface UseConfirmationDialogReturn {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  confirm: () => void;
  options: UseConfirmationDialogOptions;
  setOptions: (options: Partial<UseConfirmationDialogOptions>) => void;
}
