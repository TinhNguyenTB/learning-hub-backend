import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super(); // Gọi constructor của PrismaClient

        // Tạo extension xóa mềm cho các models
        const softDeleteExtension = createSoftDeleteExtension({
            models: {
                Comment: true,
                Category: true,
                Course: true,
                Level: true,
                Progress: true,
                Purchase: true,
                Rating: true,
                Resource: true,
                Section: true,
                Status: true,
                StripeCustomer: true,
                SubCategory: true,
                User: true,
            },
        });

        // Mở rộng Prisma Client với extension soft delete
        const extendedClient = this.$extends(softDeleteExtension);

        // Ánh xạ extendedClient vào instance
        Object.assign(this, extendedClient);
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
