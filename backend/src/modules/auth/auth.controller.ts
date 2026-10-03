import { Controller, Post, Body, Get, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, SteamProfile } from './auth.service';
import { SteamAuthGuard } from './guards/steam.guard';

type SteamRequest = Omit<Request, 'user'> & {
  user?: SteamProfile;
};

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

  @Get('steam')
  @UseGuards(SteamAuthGuard)
  async steamLogin() {
    // Automatically redirects to https://steamcommunity.com/openid/login
  }

  @Get('steam/return')
  @UseGuards(SteamAuthGuard)
  async steamReturn(@Req() req: SteamRequest, @Res() res: Response) {
    const steamUser = req.user;

    if (!steamUser) {
      throw new UnauthorizedException('Steam authentication failed');
    }

    // Persist or find the user in your database, then create a session or JWT
    const result = await this.authService.validateOrCreateSteamUser(steamUser);

    // In production: redirect back to Next.js/React frontend with auth cookie/token
    // return res.redirect(`http://localhost:5173/auth/callback?token=${result.jwt}`);
    
    return res.status(200).json({
      message: 'Steam login successful',
      user: result,
    });
  }
}
