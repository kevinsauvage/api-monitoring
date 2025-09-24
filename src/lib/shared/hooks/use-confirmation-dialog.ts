"use client";

import { useState, useCallback } from "react";

import type {
  UseConfirmationDialogOptions,
  UseConfirmationDialogReturn,
} from "../types";

export function useConfirmationDialog(
  initialOptions: UseConfirmationDialogOptions
): UseConfirmationDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptionsState] = useState(initialOptions);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirm = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const setOptions = useCallback(
    (newOptions: Partial<UseConfirmationDialogOptions>) => {
      setOptionsState((prev) => ({ ...prev, ...newOptions }));
    },
    []
  );

  return {
    isOpen,
    openDialog,
    closeDialog,
    confirm,
    options,
    setOptions,
  };
}
