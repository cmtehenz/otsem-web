import { Body, Controller, Get, Headers, Post, Query, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

@Controller('payments')
export class PaymentsController {
  constructor(
    private service: PaymentsService,
    private prisma: PrismaService,
  ) {}

  @Post('create-link')
  async createLink(@Body() body: {
    merchantId: string;
    description: string;
    amountBRL: number;       // em centavos
    installmentsMax: number; // 1..10
    interestMode: 'MERCHANT' | 'CUSTOMER';
  }) {
    return this.service.createCheckoutLink(body);
  }

  @Post('webhook/mercadopago')
  async webhookMP(@Req() req: any, @Headers('x-signature') signature: string) {
    const prismaAny = this.prisma as any;

    await prismaAny.webhookEvent.create({
      data: {
        provider: 'MERCADOPAGO',
        eventType: req?.query?.type ?? 'unknown',
        rawBody: req.body,
        signature: signature ?? null,
        relatedId: req?.query?.data?.id ?? null,
      },
    });

    const type = req?.query?.type as string | undefined;
    const paymentId = req?.query?.data?.id as string | undefined;

    if (type === 'payment' && paymentId) {
      const mp = axios.create({
        baseURL: 'https://api.mercadopago.com',
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      const { data } = await mp.get(`/v1/payments/${paymentId}`);
      const externalRef = data?.external_reference as string | undefined;

      const map: Record<string, string> = {
        approved: 'PAID',
        authorized: 'APPROVED',
        refunded: 'REFUNDED',
        cancelled: 'CANCELED',
        rejected: 'FAILED',
        in_process: 'PENDING',
        in_mediation: 'PENDING',
        pending: 'PENDING',
      };
      const newStatus = map[data?.status] ?? 'PENDING';

      if (externalRef) {
        await this.service.updateStatusByExternalRef(externalRef, newStatus, String(data?.id));
      }
    }

    return { ok: true };
  }

  @Get('return/success') success(@Query() q: any) { return { ok: true, status: 'success', q }; }
  @Get('return/failure') failure(@Query() q: any) { return { ok: true, status: 'failure', q }; }
  @Get('return/pending') pending(@Query() q: any) { return { ok: true, status: 'pending', q }; }
}
