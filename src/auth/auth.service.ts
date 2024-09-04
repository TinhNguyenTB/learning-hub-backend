import { comparePassword } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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

  async login(user: User) {
    const payload = { username: user.name, sub: user.id };
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}