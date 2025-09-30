import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '@/modules/users/users.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CoursesModule } from '@/modules/courses/courses.module';
import { LevelsModule } from '@/modules/levels/levels.module';
import { ProgressModule } from '@/modules/progress/progress.module';
import { PurchasesModule } from '@/modules/purchases/purchases.module';
import { ResourcesModule } from '@/modules/resources/resources.module';
import { SectionsModule } from '@/modules/sections/sections.module';
import { SubcategoriesModule } from '@/modules/subcategories/subcategories.module';
import { AuthModule } from '@/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { StatusModule } from '@/modules/status/status.module';
import { WebhookModule } from '@/webhook/webhook.module';
import { RatingsModule } from '@/modules/ratings/ratings.module';
import { CommentsModule } from '@/modules/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    CoursesModule,
    LevelsModule,
    ProgressModule,
    PurchasesModule,
    ResourcesModule,
    SectionsModule,
    SubcategoriesModule,
    StatusModule,
    WebhookModule,
    RatingsModule,
    CommentsModule,

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"Learning Hub" <no-reply@localhost>',
        },
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
