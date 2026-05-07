import api from "./api";
import type { AuthUser } from "../types";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: "USER" | "COMPANY";
}

export interface CompanyData {
  company_name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  license_number?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async getProfile(): Promise<{ success: boolean; data: AuthUser }> {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  async registerCompany(
    data: CompanyData,
  ): Promise<{ success: boolean; data: any }> {
    const response = await api.post("/auth/company/register", data);
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  getUser(): AuthUser | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  setAuth(token: string, user: AuthUser) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
