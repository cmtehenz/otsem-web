// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Conecta com o banco ao iniciar a aplicação
  async onModuleInit() {
    await this.$connect();
  }

  // Desconecta do banco ao encerrar a aplicação
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Usa transação em testes (ou contextos especiais)
   * Exemplo de uso avançado: await prisma.$transaction([...])
   */
  cleanDatabase() {
    return this.$transaction([
      this.client.deleteMany(), // Apague essa linha ou edite conforme seus models
      this.transaction.deleteMany(),
      this.wallet.deleteMany(),
      this.address.deleteMany(),
    ]);
  }
}