import { comparePassword } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthJWTPayload } from '@/auth/types/auth-jwt-payload';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

  async login(user: IUser) {
    const payload: AuthJWTPayload = {
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
        isActive: user.isActive
      },
      access_token: this.jwtService.sign(payload)
    };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) {
      return user
    }
    return await this.usersService.handleLoginGoogle(googleUser)
  }

}
