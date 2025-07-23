import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  Loan,
  LoanResponse,
  Applicant,
} from '../../common/interfaces/loan-interface';
import { UserRole } from '../../common/enums/user';
import { LoanStatus } from '../../common/enums/loan';

@Injectable()
export class LoanService implements OnModuleInit {
  private loans: Loan[] = [];

  async onModuleInit() {
    await this.loadLoans();
  }

  private async loadLoans(): Promise<void> {
    try {
      const dataPath = path.join(process.cwd(), 'src', 'data', 'loans.json');
      const data = await fs.readFile(dataPath, 'utf8');
      this.loans = JSON.parse(data);
    } catch (error) {
      console.error('Error loading loans:', error);
      throw new Error('Failed to initialize loan data');
    }
  }

  private filterLoansByRole(loans: Loan[], userRole: UserRole): Loan[] {
    if (userRole === UserRole.STAFF) {
      // Staff cannot see totalLoan
      return loans.map((loan) => ({
        ...loan,
        applicant: {
          ...loan.applicant,
          totalLoan: undefined, // Hide totalLoan for staff
        },
      }));
    }
    // Admin and SuperAdmin can see everything
    return loans;
  }

  async getAllLoans(
    userRole: UserRole,
    status?: LoanStatus,
  ): Promise<LoanResponse> {
    let filteredLoans = [...this.loans];

    // Filter by status if provided
    if (status) {
      filteredLoans = filteredLoans.filter((loan) => loan.status === status);
    }

    // Apply role-based filtering
    const loansWithRoleFilter = this.filterLoansByRole(filteredLoans, userRole);

    return {
      loans: loansWithRoleFilter,
      total: loansWithRoleFilter.length,
      message: 'Loans retrieved successfully',
    };
  }

  async getUserLoans(
    userEmail: string,
    userRole: UserRole,
  ): Promise<LoanResponse> {
    const userLoans = this.loans.filter(
      (loan) => loan.applicant.email.toLowerCase() === userEmail.toLowerCase(),
    );

    if (userLoans.length === 0) {
      return {
        loans: [],
        total: 0,
        message: 'No loans found for this user',
      };
    }

    // Apply role-based filtering
    const loansWithRoleFilter = this.filterLoansByRole(userLoans, userRole);

    return {
      loans: loansWithRoleFilter,
      total: loansWithRoleFilter.length,
      message: 'User loans retrieved successfully',
    };
  }

  async getExpiredLoans(userRole: UserRole): Promise<LoanResponse> {
    const currentDate = new Date();

    const expiredLoans = this.loans.filter((loan) => {
      const maturityDate = new Date(loan.maturityDate);
      return maturityDate < currentDate;
    });

    // Apply role-based filtering
    const loansWithRoleFilter = this.filterLoansByRole(expiredLoans, userRole);

    return {
      loans: loansWithRoleFilter,
      total: loansWithRoleFilter.length,
      message: 'Expired loans retrieved successfully',
    };
  }

  async deleteLoan(
    loanId: string,
    userRole: UserRole,
  ): Promise<{ message: string }> {
    // Only super admin can delete loans
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can delete loans');
    }

    const loanIndex = this.loans.findIndex((loan) => loan.id === loanId);

    if (loanIndex === -1) {
      throw new NotFoundException(`Loan with ID ${loanId} not found`);
    }

    this.loans.splice(loanIndex, 1);

  

    return {
      message: `Loan with ID ${loanId} has been successfully deleted`,
    };
  }
}
