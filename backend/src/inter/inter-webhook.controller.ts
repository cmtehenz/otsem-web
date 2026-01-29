import { Body, Controller, Logger, Post } from '@nestjs/common';
import { InterWebhookService } from './inter-webhook.service';

@Controller('inter/webhook')
export class InterWebhookController {
  private readonly logger = new Logger(InterWebhookController.name);

  constructor(private readonly webhookService: InterWebhookService) {}

  @Post('notify')
  async receberNotificacao(@Body() body: any) {
    this.logger.log(`📥 Recebido Webhook PIX: ${JSON.stringify(body)}`);
    const result = await this.webhookService.processarWebhookPix(body);
    return { message: 'Webhook processado com sucesso!', result };
  }
}
