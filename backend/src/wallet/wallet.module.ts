// src/wallet/wallet.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MultiWalletService } from './multi-wallet.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientsModule } from '@src/clients/clients.module';

@Module({
  imports: [forwardRef(() => ClientsModule)],
  providers: [WalletService, PrismaService, MultiWalletService],
  controllers: [WalletController],
  exports: [MultiWalletService]
})
export class WalletModule { }
