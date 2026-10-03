import { Controller, Post, Body, Get, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, SteamProfile } from './auth.service';
import { SteamAuthGuard } from './guards/steam.guard';
import { GoogleAuthGuard } from './guards/google.guard';

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

  @Get('login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // req.user contains the normalized profile returned by validate()
    const googleUser = req.user;

    return res.status(200).json({
      message: 'Logged in successfully via Google!',
      user: googleUser,
    });
  }  

  @Get('steam')
  @UseGuards(SteamAuthGuard)
  async steamLogin() {}

  @Get('steam/return')
  @UseGuards(SteamAuthGuard)
  async steamReturn(@Req() req: SteamRequest, @Res() res: Response) {
    const steamUser = req.user;

    if (!steamUser) {
      throw new UnauthorizedException('Steam authentication failed');
    }

    // const result = await this.authService.validateOrCreateSteamUser(steamUser);

    const result = {
      steamId: steamUser.steamId,
      username: steamUser.personaName || `SteamUser_${steamUser.steamId}`,
      avatarUrl: steamUser.avatar,
    }
    
    return res.status(200).json({
      message: 'Steam login successful',
      user: result,
    });
  }
}
