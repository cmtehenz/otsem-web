import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { PixService } from './pix.service';

@Controller('inter/pix')
export class PixController {
  private readonly logger = new Logger(PixController.name);

  constructor(private readonly pixService: PixService) {}

  /**
   * ✅ Gera uma cobrança PIX
   * @body {valor, descricao, clientId}
   */
  @Post('cobranca')
  async gerarCobrancaPix(
    @Body() body: { valor: number; descricao: string; clientId: string },
  ) {
    const { valor, descricao, clientId } = body;

    this.logger.log(
      `🚀 Gerando cobrança PIX para cliente ${clientId} | Valor: ${valor} | Descrição: ${descricao}`,
    );

    const cobranca = await this.pixService.gerarCobrancaPix(
      valor,
      descricao,
      clientId,
    );

    return {
      message: 'Cobrança PIX gerada com sucesso!',
      cobranca,
    };
  }

  /**
   * ✅ Consulta uma cobrança pelo TXID
   */
  @Get('cobranca/:txid')
  async consultarCobranca(@Param('txid') txid: string) {
    const cobranca = await this.pixService.consultarCobranca(txid);
    return {
      message: 'Cobrança consultada com sucesso!',
      cobranca,
    };
  }

  /**
   * ✅ Lista todas as cobranças do cliente
   */
  @Get('cobrancas/:clientId')
  async listarCobrancas(@Param('clientId') clientId: string) {
    const cobrancas = await this.pixService.listarCobrancas(clientId);
    return {
      message: 'Cobranças encontradas com sucesso!',
      cobrancas,
    };
  }
}
