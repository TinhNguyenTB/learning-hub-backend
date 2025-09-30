import { Controller, Post, Req, RawBodyRequest, Headers } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Public, ResponseMessage } from '@/decorator/customize';
import { Request } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @Post()
  @ResponseMessage('Webhook listener')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('Stripe-Signature') signature: string,
  ) {
    const rawBody = req.rawBody; // returns a `Buffer`
    return this.webhookService.handleWebhook(rawBody, signature);
  }
}
