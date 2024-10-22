import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from '@/core/transform.interceptor';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get('PORT');
  const reflector = app.get(Reflector);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  // Enable interceptor globally
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // Enable authentication globally
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.setGlobalPrefix('api', { exclude: [''] })

  // version 1
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1']
  })

  //config cors
  app.enableCors(
    {
      "origin": true,
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      credentials: true
    }
  );

  await app.listen(port);
}
bootstrap();
