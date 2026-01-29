import { Controller, Get, UseGuards, Req, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ClientsService } from '@src/clients/clients.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly walletService: WalletService) { }

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.walletService.getWalletBalance(userId);
  }

}
