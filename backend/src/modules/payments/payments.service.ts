// src/modules/payments/payments.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly mp = axios.create({
    baseURL: 'https://api.mercadopago.com',
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  constructor(private prisma: PrismaService) {}

  async createCheckoutLink(params: {
    merchantId: string;
    description: string;
    amountBRL: number;       // em centavos
    installmentsMax: number; // 1..10
    interestMode: 'MERCHANT' | 'CUSTOMER';
  }) {
    const prismaAny = this.prisma as any;

    // Base URL com default (evita undefined)
    const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3001';

    // 1) valida merchant
    const merchant = await prismaAny.merchant.findUnique({
      where: { id: params.merchantId },
    });
    if (!merchant || merchant.status !== 'ACTIVE') {
      throw new BadRequestException('Merchant inválido ou inativo');
    }

    // 2) cria intent local
    const intent = await prismaAny.paymentIntent.create({
      data: {
        merchantId: params.merchantId,
        description: params.description,
        amountBRL: params.amountBRL,
        installmentsMax: params.installmentsMax,
        interestMode: params.interestMode,
        provider: 'MERCADOPAGO',
        status: 'PENDING',
      },
      select: { id: true },
    });

    // 3) monta preference do MP (SEM auto_return)
    const preference = {
      items: [
        {
          title: params.description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: params.amountBRL / 100,
        },
      ],
      external_reference: intent.id,
      back_urls: {
        success: `${BASE_URL}/payments/return/success`,
        failure: `${BASE_URL}/payments/return/failure`,
        pending: `${BASE_URL}/payments/return/pending`,
      },
      // auto_return: 'approved', // ⛔️ REMOVIDO para não exigir back_urls com restrição
      notification_url: `${BASE_URL}/payments/webhook/mercadopago`,
      statement_descriptor: 'OTSEM PAY',
    };

    // Log para conferir
    console.log('MP preference back_urls =>', preference.back_urls);
    console.log('MP preference notification_url =>', preference.notification_url);

    try {
      const { data } = await this.mp.post('/checkout/preferences', preference);

      await prismaAny.paymentIntent.update({
        where: { id: intent.id },
        data: {
          checkoutUrl: data.init_point ?? data.sandbox_init_point ?? null,
          providerPaymentId: null,
        },
      });

      return { intentId: intent.id, checkoutUrl: data.init_point ?? data.sandbox_init_point };
    } catch (err: any) {
      console.error('MP ERROR >>>', err?.response?.status, err?.response?.data || err?.message);

      throw new BadRequestException({
        message: 'Erro ao criar preferência no Mercado Pago',
        httpStatusFromMP: err?.response?.status ?? 500,
        details: err?.response?.data ?? err?.message ?? 'Erro desconhecido',
        hint: `Verifique APP_BASE_URL atual (${BASE_URL}) e MP_ACCESS_TOKEN no .env`,
      });
    }
  }

  async updateStatusByExternalRef(externalRef: string, newStatus: string, providerPaymentId?: string) {
    const prismaAny = this.prisma as any;
    await prismaAny.paymentIntent.update({
      where: { id: externalRef },
      data: { status: newStatus, providerPaymentId: providerPaymentId ?? null },
    });
  }
}
