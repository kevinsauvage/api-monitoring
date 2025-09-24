/**
 * Unified API result types to eliminate duplication
 */

export interface BaseApiResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiResult<T = unknown> extends BaseApiResult {
  data?: T;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResultWithValidation<T = unknown> extends ApiResult<T> {
  zodError?: ValidationError[];
}

export interface CreateApiResult extends BaseApiResult {
  id?: string;
}

export interface PaginatedApiResult<T> extends ApiResult<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Utility types for common patterns
export type ServiceResult<T = unknown> = ApiResult<T>;
export type CreateServiceResult = CreateApiResult;
export type ValidationServiceResult<T = unknown> = ApiResultWithValidation<T>;
