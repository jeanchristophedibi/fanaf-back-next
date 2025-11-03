/**
 * Axios-like wrapper around the native fetch API
 * Provides axios-compatible interface for backward compatibility
 */

const API_BASE_URL = 'https://core-f26.asacitechnologies.com/api/v1';

interface AxiosRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
}

interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: AxiosRequestConfig;
}

class AxiosInstance {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fanaf_token');
    }
    return null;
  }

  /**
   * Build headers with authentication
   */
  private buildHeaders(customHeaders?: Record<string, string>, isFormData: boolean = false): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(isFormData ? {} : this.defaultHeaders), // Ne pas ajouter Content-Type pour FormData
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    if (!params) {
      return fullURL;
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `${fullURL}?${queryString}` : fullURL;
  }

  /**
   * Generic request method
   */
  private async request<T = any>(
    method: string,
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const fullURL = this.buildURL(url, config?.params);
    
    // Détecter si c'est du FormData
    const isFormData = config?.data instanceof FormData;
    const headers = this.buildHeaders(config?.headers, isFormData);

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (config?.data && method !== 'GET' && method !== 'HEAD') {
      // Si c'est FormData, l'envoyer tel quel, sinon JSON.stringify
      fetchOptions.body = isFormData ? config.data : JSON.stringify(config.data);
    }

    try {
      const response = await fetch(fullURL, fetchOptions);

      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP Error: ${response.status}`;
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('fanaf_token');
            localStorage.removeItem('fanaf_user');
            document.cookie = 'fanaf_token=; path=/; max-age=0; SameSite=Lax';
            document.cookie = 'fanaf_role=; path=/; max-age=0; SameSite=Lax';
            
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signin')) {
              window.location.href = '/login';
            }
          }
        }

        throw new Error(errorMessage);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: config || {},
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Request failed: ${String(error)}`);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('GET', url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', url, { ...config, data });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', url, { ...config, data });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('PATCH', url, { ...config, data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('DELETE', url, config);
  }
}

// Create and export a default instance
const axiosInstance = new AxiosInstance();

export default axiosInstance;

