import axios, { AxiosError, AxiosResponse } from 'axios';
import { LoginCredentials, LoginResponse, AuthTokens, ApiError } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private static instance: ApiService;
  private baseURL: string;

  private constructor() {
    this.baseURL = API_URL;
    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/refresh')) {
          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post<{ data: { tokens: AuthTokens } }>(
                `${this.baseURL}/auth/refresh`,
                { refreshToken }
              );
              
              const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
              this.setTokens(accessToken, newRefreshToken);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  public clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Auth endpoints
  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axios.post<{ data: LoginResponse }>(
      `${this.baseURL}/auth/login`,
      credentials
    );
    
    const { user, tokens } = response.data.data;
    this.setTokens(tokens.accessToken, tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  }

  public async logout(): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/auth/logout`);
    } finally {
      this.clearTokens();
    }
  }

  public async getCurrentUser() {
    const response = await axios.get<{ data: { user: any } }>(`${this.baseURL}/auth/me`);
    return response.data.data.user;
  }

  // User endpoints
  public async getUsers(params?: any) {
    const response = await axios.get<{ data: PaginatedResponse<any> }>(`${this.baseURL}/users`, { params });
    return response.data.data;
  }

  public async getUser(id: string) {
    const response = await axios.get<{ data: any }>(`${this.baseURL}/users/${id}`);
    return response.data.data;
  }

  public async createUser(data: any) {
    const response = await axios.post<{ data: any }>(`${this.baseURL}/users`, data);
    return response.data.data;
  }

  public async updateUser(id: string, data: any) {
    const response = await axios.patch<{ data: any }>(`${this.baseURL}/users/${id}`, data);
    return response.data.data;
  }

  public async updateUserStatus(id: string, isActive: boolean) {
    const response = await axios.patch<{ data: any }>(`${this.baseURL}/users/${id}/status`, { isActive });
    return response.data.data;
  }

  public async resetPassword(id: string, password: string) {
    const response = await axios.patch<{ data: any }>(`${this.baseURL}/users/${id}/reset-password`, { password });
    return response.data.data;
  }

  // Category endpoints
  public async getCategories(params?: any) {
    const response = await axios.get<{ data: PaginatedResponse<any> }>(`${this.baseURL}/categories`, { params });
    return response.data.data;
  }

  public async getAllCategories() {
    const response = await axios.get<{ data: any[] }>(`${this.baseURL}/categories/all`);
    return response.data.data;
  }

  public async getCategory(id: string) {
    const response = await axios.get<{ data: any }>(`${this.baseURL}/categories/${id}`);
    return response.data.data;
  }

  public async createCategory(data: any) {
    const response = await axios.post<{ data: any }>(`${this.baseURL}/categories`, data);
    return response.data.data;
  }

  public async updateCategory(id: string, data: any) {
    const response = await axios.patch<{ data: any }>(`${this.baseURL}/categories/${id}`, data);
    return response.data.data;
  }

  public async deleteCategory(id: string) {
    const response = await axios.delete<{ data: any }>(`${this.baseURL}/categories/${id}`);
    return response.data.data;
  }

  // Item endpoints
  public async getItems(params?: any) {
    const response = await axios.get<{ data: PaginatedResponse<any> }>(`${this.baseURL}/items`, { params });
    return response.data.data;
  }

  public async getItem(id: string) {
    const response = await axios.get<{ data: any }>(`${this.baseURL}/items/${id}`);
    return response.data.data;
  }

  public async createItem(data: any) {
    const response = await axios.post<{ data: any }>(`${this.baseURL}/items`, data);
    return response.data.data;
  }

  public async updateItem(id: string, data: any) {
    const response = await axios.patch<{ data: any }>(`${this.baseURL}/items/${id}`, data);
    return response.data.data;
  }

  public async deleteItem(id: string) {
    const response = await axios.delete<{ data: any }>(`${this.baseURL}/items/${id}`);
    return response.data.data;
  }

  public async getLowStockItems(limit?: number) {
    const response = await axios.get<{ data: any[] }>(`${this.baseURL}/items/low-stock`, {
      params: { limit }
    });
    return response.data.data;
  }

  public async searchItems(search: string) {
    const response = await axios.get<{ data: any[] }>(`${this.baseURL}/items/search`, {
      params: { search }
    });
    return response.data.data;
  }

  // Movement endpoints
  public async getMovements(params?: any) {
    const response = await axios.get<{ data: PaginatedResponse<any> }>(`${this.baseURL}/movements`, { params });
    return response.data.data;
  }

  public async getRecentMovements(limit?: number) {
    const response = await axios.get<{ data: any[] }>(`${this.baseURL}/movements/recent`, {
      params: { limit }
    });
    return response.data.data;
  }

  public async createMovement(data: any) {
    const response = await axios.post<{ data: any }>(`${this.baseURL}/movements`, data);
    return response.data.data;
  }

  public async getMovementStats(itemId?: string) {
    const response = await axios.get<{ data: any }>(`${this.baseURL}/movements/stats`, {
      params: { itemId }
    });
    return response.data.data;
  }

  // Dashboard endpoints
  public async getDashboardStats() {
    const response = await axios.get<{ data: any }>(`${this.baseURL}/dashboard/stats`);
    return response.data.data;
  }

  public async getUserStats() {
    const response = await axios.get<{ data: any }>(`${this.baseURL}/dashboard/user-stats`);
    return response.data.data;
  }

  public async getCategoryDistribution() {
    const response = await axios.get<{ data: any[] }>(`${this.baseURL}/dashboard/category-distribution`);
    return response.data.data;
  }
}

export const api = ApiService.getInstance();