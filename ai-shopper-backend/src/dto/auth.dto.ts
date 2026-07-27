export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResultDto {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken?: string;
  refreshToken?: string;
}
