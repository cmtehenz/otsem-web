import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExchangeService {
    constructor(private readonly prisma: PrismaService) { }

    async getExchangeRate(targetCurrency: string): Promise<number> {
        const validCurrencies = ['tether', 'usd-coin', 'bitcoin', 'ethereum', 'solana'];
        if (!validCurrencies.includes(targetCurrency)) {
            throw new BadRequestException('Moeda de destino inválida.');
        }

        try {
            const { data } = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${targetCurrency}&vs_currencies=brl`
            );

            const rate = data?.[targetCurrency]?.brl;

            if (!rate) {
                throw new Error('Cotação não encontrada.');
            }

            return rate;
        } catch (error) {
            throw new HttpException('Erro ao buscar cotação', HttpStatus.BAD_REQUEST);
        }
    }

    async simulateExchange(amount_brl: number, target_currency: string, clientId: string) {
        // ✅ 1. Verificar saldo da carteira BRL do cliente
        const walletBRL = await this.prisma.wallet.findFirst({
            where: {
                ownerId: clientId,
                ownerType: 'CLIENT',
                asset: 'BRL',
            },
        });

        if (!walletBRL || walletBRL.balance.toNumber() < amount_brl) {
            throw new BadRequestException('Saldo insuficiente para realizar a operação.');
        }

        // ✅ 2. Obter cotação e aplicar spread
        const marketRate = await this.getExchangeRate(target_currency);
        const spreadPercentage = 0.07;
        const usedRate = marketRate * (1 - spreadPercentage);
        const targetAmount = amount_brl / usedRate;

        // ✅ 3. Criar registro de câmbio
        const exchange = await this.prisma.exchange.create({
            data: {
                clientId,
                amount_brl,
                target_currency,
                target_amount: targetAmount,
                market_rate: marketRate,
                used_rate: usedRate,
            },
        });

        // ✅ 4. Debitar o valor da carteira BRL
        await this.prisma.wallet.update({
            where: { id: walletBRL.id },
            data: {
                balance: {
                    decrement: amount_brl,
                },
            },
        });

        // ✅ 5. Creditar o valor na carteira da moeda de destino (criando se necessário)
        let targetWallet = await this.prisma.wallet.findFirst({
            where: {
                ownerId: clientId,
                ownerType: 'CLIENT',
                asset: target_currency,
            },
        });

        if (!targetWallet) {
            // Criar nova carteira com saldo inicial
            await this.prisma.wallet.create({
                data: {
                    ownerId: clientId,
                    ownerType: 'CLIENT',
                    asset: target_currency,
                    balance: targetAmount,
                },
            });
        } else {
            // Atualizar saldo existente
            await this.prisma.wallet.update({
                where: { id: targetWallet.id },
                data: {
                    balance: {
                        increment: targetAmount,
                    },
                },
            });
        }

        return {
            ...exchange,
            formatted_target_amount: targetAmount.toFixed(6),
        };
    }
}