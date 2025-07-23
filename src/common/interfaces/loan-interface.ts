import { UserRole } from '../enums/user';
import { LoanStatus } from '../enums/loan';

export interface Applicant {
  name: string;
  email: string;
  telephone: string;
  totalLoan?: string; 
}

export interface Loan {
  id: string;
  amount: string;
  maturityDate: string;
  status: LoanStatus;
  applicant: Applicant;
  createdAt: string;
}

export interface LoanResponse {
  loans: Loan[];
  total: number;
  message?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}
