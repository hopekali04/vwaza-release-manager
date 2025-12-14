/**
 * API Configuration and HTTP Client
 * Centralized HTTP client with auth token management
 */
import { showToast } from './toast';
import { authService } from '~/services/auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiError {
  message: string;
  statusCode: number;
  requestId?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('vwaza_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const apiError: ApiError = {
          message: errorData.error?.message || 'Request failed',
          statusCode: response.status,
          requestId: errorData.error?.requestId,
          details: errorData.error?.details,
        };

        // Handle auth errors globally: logout and redirect
        if (apiError.statusCode === 401) {
          authService.logout();
          showToast({
            variant: 'error',
            title: 'Session expired',
            message: 'Please log in again.',
          });
          // Redirect to login
          window.location.href = '/login';
          throw apiError;
        }

        showToast({
          variant: 'error',
          title: 'We could not complete that action',
          message: apiError.message || 'Something went wrong',
        });
        throw apiError;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      const apiError: ApiError = {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      };
      showToast({
        variant: 'error',
        title: 'Network issue',
        message: apiError.message,
      });
      throw apiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const apiError: ApiError = {
          message: errorData.error?.message || 'Upload failed',
          statusCode: response.status,
          requestId: errorData.error?.requestId,
          details: errorData.error?.details,
        };

        if (apiError.statusCode === 401) {
          authService.logout();
          showToast({
            variant: 'error',
            title: 'Session expired',
            message: 'Please log in again.',
          });
          window.location.href = '/login';
          throw apiError;
        }

        throw apiError;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      } as ApiError;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
