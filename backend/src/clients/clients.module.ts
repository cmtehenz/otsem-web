// src/clients/clients.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '@src/wallet/wallet.module';

@Module({
  imports: [forwardRef(() => AuthModule), WalletModule],
  controllers: [ClientsController],
  providers: [ClientsService, PrismaService],
  exports: [ClientsService],
})
export class ClientsModule { }
