import { stripe } from '@/lib/stripe';
import { PrismaService } from '@/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from "stripe";

@Injectable()
export class WebhookService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) { }

    async handleWebhook(rawBody: Buffer, signature: string) {
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                this.configService.get<string>("STRIPE_WEBHOOK_SECRET")
            )
        } catch (error: any) {
            throw new BadRequestException(`Webhook signature verification failed:: ${error.message}`)
        }

        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session?.metadata?.customerId
        const courseId = session?.metadata?.courseId
        if (event.type === 'checkout.session.completed') {
            if (!customerId || !courseId) {
                throw new BadRequestException(`Missing metadata`)
            }
            await this.prisma.purchase.create({
                data: {
                    customerId,
                    courseId
                }
            })
        }
        else {
            throw new BadRequestException(`Unhandled event type: ${event.type}`)
        }
        return "Success"
    }
}
