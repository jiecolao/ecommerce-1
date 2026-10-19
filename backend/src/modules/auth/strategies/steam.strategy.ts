// backend/src/modules/auth/strategies/steam.strategy.ts
import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { ConfigService } from '@nestjs/config';
import type { SteamProfile } from 'shared';
import { publicSteamProfile, steamIdFromIdentifier } from '../steam-profile';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  private readonly apiKey: string;

  constructor(configService: ConfigService) {
    const options = {
      returnURL: configService.get<string>('STEAM_RETURN_URL') || 'http://localhost:3000/api/auth/login/steam/return',
      realm: configService.get<string>('STEAM_REALM') || 'http://localhost:3000/',
      apiKey: configService.get<string>('STEAM_API_KEY') || '',
      // Keep Passport's OpenID verification, but bypass steam-web's HTTP
      // profile lookup, which places the API key in an unencrypted URL.
      profile: false,
    };
    super(options);
    this.apiKey = options.apiKey;
  }

  async validate(
    identifier: string,
    _profile: unknown,
    _done: (err: unknown, user: unknown) => void,
  ): Promise<SteamProfile> {
    const steamId = steamIdFromIdentifier(identifier);
    if (!steamId) throw new UnauthorizedException('Steam authentication failed');
    if (!this.apiKey) throw new ServiceUnavailableException('Steam authentication unavailable');

    let payload: unknown;
    try {
      const url = new URL('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/');
      url.searchParams.set('key', this.apiKey);
      url.searchParams.set('steamids', steamId);
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error('Steam profile lookup failed');
      payload = await response.json();
    } catch {
      // Fetch/JSON errors may include the credential-bearing request URL or
      // upstream response. Do not log, attach or serialize those details.
      throw new ServiceUnavailableException('Steam authentication unavailable');
    }

    const players = (payload as { response?: { players?: unknown } } | null)?.response?.players;
    if (!Array.isArray(players) || players.length !== 1
      || !players[0] || typeof players[0] !== 'object') {
      throw new UnauthorizedException('Steam authentication failed');
    }
    const player = players[0] as Record<string, unknown>;
    if (player.steamid !== steamId) throw new UnauthorizedException('Steam authentication failed');
    return publicSteamProfile({
      steamId,
      personaName: player.personaname,
      avatar: player.avatarfull,
      profileUrl: player.profileurl,
    })!;
  }
}
