import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) { }

  async getWalletBalance(userId: string) {
    return this.prisma.wallet.findMany({
      where: {
        ownerId: userId,
        ownerType: 'CLIENT', // ou 'USER' se for usuário interno
      },
      select: {
        asset: true,
        balance: true,
      },
    });
  }
}
