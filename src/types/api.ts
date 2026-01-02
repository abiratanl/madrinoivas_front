// Your API response pattern (example)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error pattern
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}