import { comparePassword } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import { Injectable } from '@nestjs/common';


@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

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
}
