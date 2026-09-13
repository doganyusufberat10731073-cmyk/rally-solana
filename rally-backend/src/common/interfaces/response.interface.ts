export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string | string[];
  error?: string;
  statusCode?: number;
  timestamp: string;
}
