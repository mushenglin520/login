export enum AuthMode {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}

export interface User {
  username: string;
  password?: string; // In a real app, never store plain text passwords
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}