import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { PrismaModule } from '../prisma/prisma.module'; // ajuste o caminho conforme necessário

@Module({
  imports: [PrismaModule],
  controllers: [ExchangeController],
  providers: [ExchangeService],
})
export class ExchangeModule { }