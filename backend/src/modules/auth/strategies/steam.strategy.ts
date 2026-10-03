// backend/src/modules/auth/strategies/steam.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { ConfigService } from '@nestjs/config';
import { SteamProfile } from 'shared'

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(configService: ConfigService) {
    super({
      returnURL: configService.get<string>('STEAM_RETURN_URL') || 'http://localhost:3000/api/auth/steam/return',
      realm: configService.get<string>('STEAM_REALM') || 'http://localhost:3000/',
      apiKey: configService.get<string>('STEAM_API_KEY') || '',
    });
  }

  async validate(
    identifier: string,
    profile: any,
    done: (err: any, user: any) => void,
  ): Promise<SteamProfile> {
    const steamId = profile?._json?.steamid || profile?.id;

    const user = {
      steamId,
      personaName: profile?.displayName,
      avatar: profile?._json?.avatarfull,
      profileUrl: profile?._json?.profileurl,
    };

    return user;
  }
}