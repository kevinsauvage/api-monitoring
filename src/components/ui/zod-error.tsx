"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/shared/utils/utils";

interface ZodErrorProps {
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  fieldName?: string;
  className?: string;
}

/**
 * ZodError component for displaying validation errors
 *
 * @param errors - Array of Zod validation errors
 * @param fieldName - Specific field name to filter errors for
 * @param className - Additional CSS classes
 */
export function ZodError({ errors, fieldName, className }: ZodErrorProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  // Filter errors for specific field if fieldName is provided
  const relevantErrors = fieldName
    ? errors.filter((error) => error.field === fieldName)
    : errors;

  if (relevantErrors.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-1", className)}>
      {relevantErrors.map((error, index) => (
        <div
          key={`${error.field}-${index}`}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Hook for getting field-specific errors
 */
export function useZodErrors(
  errors:
    | Array<{
        field: string;
        message: string;
        code: string;
      }>
    | undefined,
  fieldName: string
) {
  if (!errors || errors.length === 0) {
    return null;
  }

  const fieldErrors = errors.filter((error) => error.field === fieldName);
  return fieldErrors.length > 0 ? fieldErrors[0] : null;
}

/**
 * Utility function to get error message for a specific field
 */
export function getFieldError(
  errors:
    | Array<{
        field: string;
        message: string;
        code: string;
      }>
    | undefined,
  fieldName: string
): string | null {
  if (!errors || errors.length === 0) {
    return null;
  }

  const fieldError = errors.find((error) => error.field === fieldName);
  return fieldError ? fieldError.message : null;
}

/**
 * Form field wrapper with integrated Zod error display
 */
interface FormFieldWithErrorProps {
  children: React.ReactNode;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  fieldName: string;
  className?: string;
}

export function FormFieldWithError({
  children,
  errors,
  fieldName,
  className,
}: FormFieldWithErrorProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
      <ZodError errors={errors ?? []} fieldName={fieldName} />
    </div>
  );
}
