import { stripe } from '@/lib/stripe';
import { PrismaService } from '@/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
    constructor(
        private prisma: PrismaService,
        private readonly mailerService: MailerService,
        private configService: ConfigService
    ) { }

    async handleWebhook(rawBody: Buffer, signature: string) {
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                this.configService.get<string>("STRIPE_WEBHOOK_SECRET")
            );
        } catch (error: any) {
            throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
        }

        const session = event.data.object as Stripe.Checkout.Session;

        const customerId = session?.metadata?.customerId;
        const courseId = session?.metadata?.courseId;

        if (!session) {
            throw new BadRequestException('Session not found');
        }

        let courseName: string | undefined;
        try {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            courseName = lineItems.data[0]?.description;
        } catch (error: any) {
            throw new BadRequestException(`Failed to retrieve line items: ${error.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            if (!customerId || !courseId) {
                throw new BadRequestException('Missing metadata');
            }

            await this.prisma.purchase.create({
                data: {
                    customerId,
                    courseId
                }
            });

            await this.mailerService.sendMail({
                to: session.customer_details.email,
                subject: 'Payment Confirmation ✔',
                template: 'checkout',
                context: {
                    customerName: session.customer_details.name,
                    amount: (session.amount_total / 100).toFixed(2),
                    currency: session.currency.toUpperCase(),
                    courseName: courseName,
                }
            });
        } else {
            throw new BadRequestException(`Unhandled event type: ${event.type}`);
        }

        return "Success";
    }
}
