// backend/src/modules/auth/strategies/steam.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(configService: ConfigService) {
    super({
      returnURL: configService.getOrThrow<string>('STEAM_RETURN_URL'),
      realm: configService.getOrThrow<string>('STEAM_REALM'),
      apiKey: configService.getOrThrow<string>('STEAM_API_KEY'),
    });
  }

  async validate(
    identifier: string,
    profile: any,
    done: (err: any, user: any) => void,
  ): Promise<any> {
    // identifier format: "https://steamcommunity.com/openid/id/76561198..."
    const steamId = profile?._json?.steamid || profile?.id;

    const user = {
      steamId,
      personaName: profile?.displayName,
      avatar: profile?._json?.avatarfull,
      profileUrl: profile?._json?.profileurl,
    };

    done(null, user);
  }
}