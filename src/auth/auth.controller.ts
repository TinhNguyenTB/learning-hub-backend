import { Controller, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { ActiveDto, ChangePasswordDto, RegisterDto, SocialMediaAccountDto } from '@/auth/dto/auth.dto';
import { LocalAuthGuard } from '@/auth/passport/local-auth.guard';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { UsersService } from '@/modules/users/users.service';
import { Response } from 'express';

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
  async login(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
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

  @Post('forgot-password')
  @Public()
  @ResponseMessage("Forgot password")
  forgotPassword(@Body("email") email: string) {
    return this.userService.handleForgotPassword(email);
  }

  @Post('change-password')
  @ResponseMessage("Change user password")
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @User() user: IUser) {
    return this.userService.handleChangePassword(changePasswordDto, user);
  }

  @Post('social-media')
  @Public()
  @ResponseMessage("Login with social media")
  loginSocialMedia(@Body() data: SocialMediaAccountDto) {
    return this.authService.loginSocialMedia(data);
  }
}
