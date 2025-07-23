import { UserRole } from "../enums";


export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

