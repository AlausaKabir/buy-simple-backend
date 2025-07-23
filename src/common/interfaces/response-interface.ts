import { UserRole } from "../enums";

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}