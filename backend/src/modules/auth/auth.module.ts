import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SteamStrategy } from './strategies/steam.strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google.guard';
import { SteamAuthGuard } from './guards/steam.guard';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService, 
    SteamStrategy, 
    GoogleStrategy,
    GoogleAuthGuard,
    SteamAuthGuard
  ],
  exports: [PassportModule, GoogleAuthGuard, SteamAuthGuard],
})

export class AuthModule {}
