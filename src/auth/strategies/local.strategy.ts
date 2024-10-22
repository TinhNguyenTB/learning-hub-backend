import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super(
            {
                usernameField: 'email',
                passwordField: 'password',
            }
        );
    }

    async validate(username: string, password: string): Promise<any> {
        if (password === "") {
            throw new UnauthorizedException("Please provide password")
        }
        const user = await this.authService.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException("Email/Password is incorrect");
        }
        if (user.isActive === false) {
            throw new ForbiddenException("The account has not been activated yet")
        }
        return user;
    }
}