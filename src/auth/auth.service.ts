import { comparePassword } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { SocialMediaAccountDto } from '@/auth/dto/auth.dto';
import refreshTokenConfig from '@/auth/config/refresh-token.config';
import { ConfigType } from '@nestjs/config';
import { AuthJWTPayload } from '@/auth/types/auth-jwt-payload';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';

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
    if (!user) {
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

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(userId, refreshToken);
    if (!user) {
      throw new UnauthorizedException("Refresh token is incorrect! Please login.");
    }
    return user
  }


  async login(user: User) {
    const payload: AuthJWTPayload = {
      name: user.name,
      id: user.id,
      email: user.email,
      role: user.role
    };
    const { access_token, refresh_token } = await this.generateTokens(payload);
    await this.usersService.updateRefreshToken(user.id, refresh_token)
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        isActive: user.isActive
      },
      access_token,
      refresh_token
    };
  }

  async refreshToken(user: User) {
    const payload: AuthJWTPayload = {
      name: user.name,
      id: user.id,
      email: user.email,
      role: user.role
    };
    const { access_token, refresh_token } = await this.generateTokens(payload);
    await this.usersService.updateRefreshToken(user.id, refresh_token)
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        isActive: user.isActive
      },
      access_token,
      refresh_token
    };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) {
      return user
    }
    return await this.usersService.handleLoginGoogle(googleUser)
  }

  async signOut(userId: string) {
    return await this.usersService.updateRefreshToken(userId, null)
  }

}
