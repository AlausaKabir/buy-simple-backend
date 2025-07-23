import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user';
import {
  GetLoansQueryDto,
  GetUserLoansParamsDto,
  DeleteLoanParamsDto,
} from '../../common/dto/loan.dto';

@Controller('loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get()
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllLoans(@Query() query: GetLoansQueryDto, @Req() req: any) {
    const userRole = req.user.role;
    return this.loanService.getAllLoans(userRole, query.status);
  }

  @Get('expired')
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getExpiredLoans(@Req() req: any) {
    const userRole = req.user.role;
    return this.loanService.getExpiredLoans(userRole);
  }

  @Get(':userEmail/get')
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getUserLoans(@Param() params: GetUserLoansParamsDto, @Req() req: any) {
    const userRole = req.user.role;
    return this.loanService.getUserLoans(params.userEmail, userRole);
  }

  @Delete(':loanId/delete')
  @Roles(UserRole.SUPER_ADMIN)
  async deleteLoan(@Param() params: DeleteLoanParamsDto, @Req() req: any) {
    const userRole = req.user.role;
    return this.loanService.deleteLoan(params.loanId, userRole);
  }
}
