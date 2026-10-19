import type { SteamProfile } from 'shared';

export function isSteamId(value: unknown): value is string {
  return typeof value === 'string' && value === value.trim() && /^[1-9]\d{0,19}$/.test(value)
    && BigInt(value) <= 18446744073709551615n;
}

export function steamIdFromIdentifier(identifier: unknown): string | undefined {
  if (typeof identifier !== 'string') return undefined;
  const match = /^https?:\/\/steamcommunity\.com\/openid\/id\/([1-9]\d{0,19})$/.exec(identifier);
  return match && match[0] === identifier && isSteamId(match[1]) ? match[1] : undefined;
}

// Shared by the provider adapter and HTTP callback. Never serialize a provider
// object wholesale: optional fields must also be scalar public profile values.
export function publicSteamProfile(value: unknown): SteamProfile | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const profile = value as Record<string, unknown>;
  if (!isSteamId(profile.steamId)) return undefined;
  return {
    steamId: profile.steamId,
    personaName: typeof profile.personaName === 'string' ? profile.personaName : undefined,
    avatar: typeof profile.avatar === 'string' ? profile.avatar : undefined,
    profileUrl: typeof profile.profileUrl === 'string' ? profile.profileUrl : undefined,
  };
}
