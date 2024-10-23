import { Controller, Post, Body, UseGuards, Request, Res, Get, Req } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { ActiveDto, ChangePasswordDto, RegisterDto, SocialMediaAccountDto } from '@/auth/dto/auth.dto';
import { LocalAuthGuard } from '@/auth/guards/local-auth.guard';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { UsersService } from '@/modules/users/users.service';
import { RefreshAuthGuard } from '@/auth/guards/refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
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
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @ResponseMessage("Refresh token")
  @UseGuards(RefreshAuthGuard)
  @Post("refresh")
  refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user)
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

  @Public()
  @UseGuards(GoogleAuthGuard)
  @ResponseMessage("Login with google")
  @Get("google/login")
  googleLogin() { }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleCallback(@Request() req, @Res() res: Response) {
    // console.log("Google user:", req.user)
    const response = await this.authService.login(req.user)
    const { id, name, email, image, isActive, role } = response.user;
    const { access_token, refresh_token } = response
    res.redirect(`http://localhost:3000/api/auth/google/callback?userId=${id}&name=${name}&email=${email}&image=${image}&isActive=${isActive}&role=${role}&accessToken=${access_token}&refreshToken=${refresh_token}`)
  }

  @Post("signout")
  @ResponseMessage("User sign out")
  signOut(@Req() req) {
    return this.authService.signOut(req.user.id)
  }

}
