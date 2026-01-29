export class WebhookPixDto {
  pix!: Array<{
    endToEndId: string;
    txid: string;
    valor: string;
    chave: string;
    horario: string;
    infoPagador?: string;
    pagador?: {
      nome?: string;
      cpfCnpj: string;
    };
  }>;
}
