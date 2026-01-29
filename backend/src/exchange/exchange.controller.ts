import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exchange')
export class ExchangeController {
    constructor(private readonly exchangeService: ExchangeService) { }

    @UseGuards(JwtAuthGuard)
    @Post('send')
    async sendExchange(
        @Body() body: { amount_brl: number; target_currency: string },
        @Req() req: any
    ) {
        const clientId = req.user.sub;
        return this.exchangeService.simulateExchange(body.amount_brl, body.target_currency, clientId);
    }
}