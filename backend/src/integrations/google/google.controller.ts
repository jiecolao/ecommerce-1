import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './google.guard';

@Controller('google')
export class GoogleController {
  // 1. Visit this route in your browser to start login
  @Get('login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // Automatically handled by GoogleAuthGuard
  }

  // 2. Google redirects the user here (matches your callback URL)
  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // req.user contains the normalized profile returned by validate()
    const googleUser = req.user;

    // Send the user profile back as JSON to verify it works
    return res.status(200).json({
      message: 'Logged in successfully via Google!',
      user: googleUser,
    });
  }
}