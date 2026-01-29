// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null;

  constructor() {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      // Sem chave -> modo NO-OP (não envia, mas também não derruba o app)
      this.logger.warn('RESEND_API_KEY não configurada. MailService em modo NO-OP (nenhum e-mail será enviado).');
      this.resend = null;
      return;
    }
    this.resend = new Resend(key);
  }

  // Mantive o MESMO método que você já usa no app:
  async sendResetPasswordEmail(to: string, resetLink: string) {
    if (!this.resend) {
      // Sem chave: apenas loga para auditoria e segue o fluxo
      this.logger.log(`(NO-OP) Reset password email para ${to} | link: ${resetLink}`);
      return { skipped: true };
    }

    try {
      const response = await this.resend.emails.send({
        from: 'Otsem Bank <onboarding@resend.dev>',
        to,
        subject: 'Recuperação de Senha - Otsem Bank',
        html: `
          <h2>Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p><a href="${resetLink}">Clique aqui para redefinir sua senha</a></p>
          <p>Se você não solicitou essa alteração, apenas ignore este e-mail.</p>
        `,
      });
      return response;
    } catch (err) {
      this.logger.error('Falha ao enviar e-mail de recuperação', err as any);
      // Não derruba a aplicação nem o fluxo do usuário
      return { error: true };
    }
  }
}