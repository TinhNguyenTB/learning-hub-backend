import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { ActiveDto, RegisterDto } from '@/auth/dto/auth.dto';
import { LocalAuthGuard } from '@/auth/passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import { UsersService } from '@/modules/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) { }

  @UseGuards(LocalAuthGuard)
  @Public()
  @ResponseMessage("User login")
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  @ResponseMessage("User register")
  register(@Body() registerDto: RegisterDto) {
    return this.userService.handleRegister(registerDto);
  }

  @Post('activate')
  @Public()
  @ResponseMessage("Activate user account")
  activate(@Body() activeDto: ActiveDto) {
    return this.userService.handleActivate(activeDto);
  }

  @Post('retry-activate')
  @Public()
  @ResponseMessage("Retry activate user account")
  retryActivate(@Body("email") email: string) {
    return this.userService.handleRetryActivate(email);
  }
}
