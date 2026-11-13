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

/** Public parent self-registration. Mirrors the backend RegisterRequest validation rules. */
export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
  address?: string;
  occupation?: string;
}

/** Registration creates a disabled (pending) account, so no token is returned. */
export interface RegisterResponse {
  username: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors: Record<string, string>;
}
