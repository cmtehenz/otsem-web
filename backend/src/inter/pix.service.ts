import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { InterAuthService } from './inter-auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PixService {
  private readonly logger = new Logger(PixService.name);
  private readonly certificate = fs.readFileSync(path.resolve('certs/certificado.pfx'));
  private readonly passphrase = process.env.INTER_PASSPHRASE || '';
  private readonly baseUrl = 'https://cdpj.partners.bancointer.com.br';

  constructor(
    private readonly authService: InterAuthService,
    private readonly prisma: PrismaService,
  ) { }

  async gerarCobrancaPix(valor: number, descricao: string, clientId: string) {
    const token = await this.authService.getAccessToken();

    const txid = randomUUID().replace(/-/g, '').substring(0, 35);

    const body = {
      calendario: { expiracao: 3600 },
      valor: { original: valor.toFixed(2) },
      chave: process.env.INTER_PIX_KEY,
      solicitacaoPagador: descricao,
    };

    const httpsAgent = new https.Agent({
      pfx: this.certificate,
      passphrase: this.passphrase,
    });

    const response = await axios.put(
      `${this.baseUrl}/pix/v2/cob/${txid}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        httpsAgent,
      },
    );

    const { loc, pixCopiaECola } = response.data;

    console.log(response.data)

    // Salvar cobrança no banco
    await this.prisma.pixCharge.create({
      data: {
        txid,
        clientId,
        status: 'ATIVA',
        valor: valor,
        solicitacao: descricao,
        location: loc.location,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });

    return {
      txid,
      location: loc.location,
      qrCode: pixCopiaECola,
    };
  }

  /**
   * ✅ Consultar uma cobrança pelo TXID
   */
  async consultarCobranca(txid: string) {
    const cobranca = await this.prisma.pixCharge.findUnique({
      where: { txid },
    });

    if (!cobranca) {
      throw new NotFoundException(`❌ Cobrança não encontrada para TXID: ${txid}`);
    }

    return cobranca;
  }

  /**
   * ✅ Listar todas as cobranças de um cliente
   */
  async listarCobrancas(clientId: string) {
    const cobrancas = await this.prisma.pixCharge.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return cobrancas;
  }
}
