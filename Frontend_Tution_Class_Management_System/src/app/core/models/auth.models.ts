export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  phone: string | null;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors: Record<string, string>;
}
