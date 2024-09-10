import { comparePassword } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { SocialMediaAccountDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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

  async login(user: User) {
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
        accountType: user.accountType
      },
      access_token: this.jwtService.sign(payload),
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
        isActive: user.isActive,
        accountType: user.accountType
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
