import { IsOptional, IsString, IsIn } from 'class-validator';
import { LoanStatus } from '../enums/loan';

export class GetLoansQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'active'])
  status?: LoanStatus;
}

export class GetUserLoansParamsDto {
  @IsString()
  userEmail: string;
}

export class DeleteLoanParamsDto {
  @IsString()
  loanId: string;
}
