import { Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SteamAuthGuard } from './guards/steam.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import { publicSteamProfile } from './steam-profile';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import type { AuthenticatedRequest } from './auth.types';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  accountContext(@Req() req: AuthenticatedRequest) {
    return this.authService.getAccountContext(req.authenticatedUser!.id);
  }

  @Post('buyer-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard)
  provisionBuyerProfile(@Req() req: AuthenticatedRequest) {
    // The guard has verified this exact bearer token. No request body, actor
    // header, role, or email selects the identity being provisioned.
    const token = req.headers.authorization!.replace(/^Bearer[ \t]+/i, '').trim();
    return this.authService.provisionBuyerProfile(req.authenticatedUser!.id, token);
  }

  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get('login/google/return')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    const googleUser = req.user as Record<string, unknown> | undefined;
    if (!googleUser || typeof googleUser.providerId !== 'string' || !googleUser.providerId
      || typeof googleUser.email !== 'string' || !googleUser.email) {
      throw new UnauthorizedException('Google authentication failed');
    }

    return res.status(200).json({
      message: 'Logged in successfully via Google!',
      // Never serialize the provider identity wholesale: it may contain tokens
      // or raw provider data added by a strategy in the future.
      user: {
        providerId: googleUser.providerId,
        email: googleUser.email,
        firstName: typeof googleUser.firstName === 'string' ? googleUser.firstName : undefined,
        lastName: typeof googleUser.lastName === 'string' ? googleUser.lastName : undefined,
        picture: typeof googleUser.picture === 'string' ? googleUser.picture : undefined,
      },
    });
  }  

  @Get('login/steam')
  @UseGuards(SteamAuthGuard)
  async steamLogin() {}

  @Get('login/steam/return')
  @UseGuards(SteamAuthGuard)
  async steamReturn(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    const steamUser = publicSteamProfile(req.user);

    if (!steamUser) {
      throw new UnauthorizedException('Steam authentication failed');
    }

    return res.status(200).json({
      message: 'Steam login successful',
      user: steamUser,
    });
  }
}
