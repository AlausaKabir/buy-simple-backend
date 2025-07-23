import { UserRole } from "../enums";

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

