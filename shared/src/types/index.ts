export interface IErrorResponse {
  error: {
    message: string;
    statusCode: number;
    requestId?: string;
  };
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
