// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 🔥 Módulos já existentes
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AddressModule } from './address/address.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionModule } from './transaction/transaction.module';
import { ClientsModule } from './clients/clients.module';
import { EventsGateway } from './socket/events.gateway';
import { InterModule } from './inter/inter.module';
import { ExchangeModule } from './exchange/exchange.module';

// 🔥 Novos módulos que criamos
import { MerchantsModule } from './modules/merchants/merchants.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🔥 módulos antigos
    AuthModule,
    InterModule,
    PrismaModule,
    AddressModule,
    WalletModule,
    TransactionModule,
    ClientsModule,
    ExchangeModule,

    // 🔥 módulos novos
    MerchantsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EventsGateway, // WebSocket
  ],
})
export class AppModule {}