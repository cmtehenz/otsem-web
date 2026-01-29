import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InterAuthService {
  private readonly logger = new Logger(InterAuthService.name);

  // Dados sensíveis via variáveis de ambiente (.env)
  private readonly clientId = process.env.INTER_CLIENT_ID;
  private readonly clientSecret = process.env.INTER_CLIENT_SECRET;

  // Caminhos dos certificados (ajuste conforme sua pasta)
  
  private readonly certPath = path.resolve('certs/certificado.crt');
  private readonly keyPath = path.resolve('certs/api_chave.key');

  // URL de autenticação do Banco Inter
  private readonly authUrl = 'https://cdpj.partners.bancointer.com.br/oauth/v2/token';

  /**
   * Método responsável por gerar e retornar o token de acesso do Banco Inter
   */
  async getAccessToken(): Promise<string> {
    try {
      const cert = fs.readFileSync(this.certPath);
      const key = fs.readFileSync(this.keyPath);

      const httpsAgent = new https.Agent({
        cert,
        key,
        rejectUnauthorized: true, // Mantém seguro
      });

      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append(
        'scope',
        'cob.read cob.write payload-location.read pix.read pix.write webhook.read webhook.write pagamento-pix.write'
      );

      const response = await axios.post(
        this.authUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
          httpsAgent,
        }
      );

      if (!response.data.access_token) {
        throw new InternalServerErrorException('Token não encontrado na resposta');
      }

      this.logger.log('Token gerado com sucesso');
      return response.data.access_token;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error('Erro na autenticação com Banco Inter', error.response?.data);
        throw new InternalServerErrorException(
          error.response?.data || 'Erro na autenticação com Banco Inter'
        );
      }
      this.logger.error('Erro desconhecido na autenticação', error);
      throw new InternalServerErrorException('Erro desconhecido na autenticação');
    }
  }
}
