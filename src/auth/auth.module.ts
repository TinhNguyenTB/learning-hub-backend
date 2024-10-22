import { Module } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { AuthController } from '@/auth/auth.controller';
import { UsersModule } from '@/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@/auth/strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import refreshTokenConfig from '@/auth/config/refresh-token.config';
import googleAuthConfig from '@/auth/config/google-auth.config';
import { RefreshStrategy } from '@/auth/strategies/refresh-token.strategy';
import { GoogleStrategy } from '@/auth/strategies/google.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forFeature(googleAuthConfig),
    ConfigModule.forFeature(refreshTokenConfig)
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule { }
