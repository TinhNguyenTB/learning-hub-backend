import { comparePassword } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { SocialMediaAccountDto } from './dto/auth.dto';
import refreshTokenConfig from './config/refresh-token.config';
import { ConfigType } from '@nestjs/config';
import { AuthJWTPayload } from './types/auth-jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshTokenConfig.KEY)
    private refreshConfig: ConfigType<typeof refreshTokenConfig>
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user || user.accountType !== "LOCAL") {
      return null;
    }

    const isValidPassword = await comparePassword(pass, user.password);
    if (!isValidPassword) {
      return null;
    }

    delete user.password
    return user;
  }

  async generateTokens(payload: AuthJWTPayload) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshConfig)
    ])
    return {
      access_token,
      refresh_token
    }
  }

  async login(user: User) {
    const payload: AuthJWTPayload = {
      name: user.name,
      id: user.id,
      email: user.email,
      role: user.role
    };
    const { access_token, refresh_token } = await this.generateTokens(payload);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        accountType: user.accountType,
        isActive: user.isActive
      },
      access_token,
      refresh_token
    };
  }

  async loginSocialMedia(data: SocialMediaAccountDto) {
    const user = await this.usersService.handleLoginSocialMedia(data);

    const payload = {
      name: user.name,
      id: user.id,
      email: user.email,
      role: user.role
    };
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        accountType: user.accountType,
        isActive: user.isActive
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
