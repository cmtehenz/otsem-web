import { Module } from '@nestjs/common';
import { InterAuthService } from './inter-auth.service';
import { PixService } from './pix.service';
import { PixController } from './pix.controller';
import { InterWebhookController } from './inter-webhook.controller';
import { InterWebhookService } from './inter-webhook.service';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PixController, InterWebhookController],
  providers: [InterAuthService, PixService, InterWebhookService],
  exports: [InterAuthService, PixService, InterWebhookService],
})
export class InterModule {}
