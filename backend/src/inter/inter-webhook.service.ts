import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InterWebhookService {
  private readonly logger = new Logger(InterWebhookService.name);

  constructor(private readonly prisma: PrismaService) { }

  async processarWebhookPix(data: any) {
    const pix = data.pix?.[0];

    if (!pix) throw new BadRequestException('Payload inválido');

    const { txid, valor, horario } = pix;
    const valorDecimal = new Prisma.Decimal(valor);
    const horarioCriacao = new Date(horario);

    // 🏦 Buscar a cobrança Pix pelo TXID
    const pixCharge = await this.prisma.pixCharge.findUnique({
      where: { txid },
    });

    if (!pixCharge) {
      throw new Error(`❌ Cobrança não encontrada para TXID: ${txid}`);
    }

    const clientId = pixCharge.clientId;

    // 🧠 Salvar o webhook recebido
    await this.prisma.pixWebhook.create({
      data: {
        txid,
        status: 'CONCLUIDA',
        valor: valorDecimal,
        horarioCriacao,
        horarioConclusao: new Date(),
        payload: data,
        clientId,
      },
    });

    // 💰 Atualizar ou criar a carteira BRL do cliente
    await this.prisma.wallet.upsert({
      where: {
        ownerId_ownerType_asset: {
          ownerId: clientId,
          ownerType: 'CLIENT',
          asset: 'BRL',
        },
      },
      update: {
        balance: { increment: valorDecimal },
      },
      create: {
        ownerId: clientId,
        ownerType: 'CLIENT',
        asset: 'BRL',
        balance: valorDecimal,
      },
    });

    // 📜 Criar uma transação de depósito
    await this.prisma.transaction.create({
      data: {
        txid,
        clientId,
        type: 'DEPOSIT',
        amount: valorDecimal,
        asset: 'BRL',
        description: 'Depósito via Pix',
      },
    });

    // 🔁 Atualizar status da cobrança
    await this.prisma.pixCharge.update({
      where: { txid },
      data: { status: 'CONCLUIDA' },
    });

    this.logger.log(`✅ Pix processado e saldo atualizado para clientId ${clientId}`);

    return { message: 'Pix processado e saldo atualizado' };
  }

}
