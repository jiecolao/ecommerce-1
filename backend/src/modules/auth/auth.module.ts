import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SteamStrategy } from './strategies/steam.strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google.guard';
import { SteamAuthGuard } from './guards/steam.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { ShopperGuard } from './guards/shopper.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService, 
    SteamStrategy, 
    GoogleStrategy,
    GoogleAuthGuard,
    SteamAuthGuard,
    SupabaseAuthGuard,
    ShopperGuard,
    AdminGuard,
  ],
  exports: [PassportModule, GoogleAuthGuard, SteamAuthGuard, AuthService, SupabaseAuthGuard, ShopperGuard, AdminGuard],
})

export class AuthModule {}
