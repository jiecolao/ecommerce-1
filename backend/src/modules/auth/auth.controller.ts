import { Controller, Post, Body, Get, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SteamAuthGuard } from './guards/steam.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import { SteamProfile } from 'shared';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: any) {
    return this.authService.signup(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get('login/google/return')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // req.user contains the normalized profile returned by validate()
    const googleUser = req.user;

    return res.status(200).json({
      message: 'Logged in successfully via Google!',
      user: googleUser,
    });
  }  

  @Get('login/steam')
  @UseGuards(SteamAuthGuard)
  async steamLogin() {}

  @Get('login/steam/return')
  @UseGuards(SteamAuthGuard)
  async steamReturn(@Req() req: Request, @Res() res: Response) {
    const steamUser = req.user as SteamProfile;

    if (!steamUser) {
      throw new UnauthorizedException('Steam authentication failed');
    }

    return res.status(200).json({
      message: 'Steam login successful',
      user: steamUser,
    });
  }
}
