import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

type HttpSecurityEnvironment = {
  NODE_ENV?: string;
  VERCEL?: string;
  CORS_ALLOWED_ORIGINS?: string;
  STEAM_SESSION_SECRET?: string;
};

export function createCorsOptions(env: HttpSecurityEnvironment = process.env): CorsOptions {
  const origins = new Set<string>();
  if (env.NODE_ENV !== 'production' && env.VERCEL !== '1') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }

  if (env.CORS_ALLOWED_ORIGINS?.trim()) {
    for (const entry of env.CORS_ALLOWED_ORIGINS.split(',')) {
      const origin = entry.trim();
      let url: URL;
      try {
        url = new URL(origin);
      } catch {
        throw invalidOriginConfiguration();
      }
      // Require the exact serialized origin a browser sends, with no path,
      // credentials, wildcard, query, fragment or opaque/null origin.
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        origin.includes('*') ||
        origin !== url.origin
      ) {
        throw invalidOriginConfiguration();
      }
      origins.add(origin);
    }
  }

  // An array also makes cors emit Vary: Origin for denied/originless requests.
  // An empty array grants no cross-origin reads; same-origin clients still work.
  return { origin: [...origins], credentials: true };
}

function invalidOriginConfiguration(): Error {
  // Configuration values can contain accidentally pasted credentials. Never echo them.
  return new Error(
    'CORS_ALLOWED_ORIGINS must contain comma-separated exact HTTP(S) origins, with no trailing slash, path, credentials, wildcard, query or fragment.',
  );
}

export function requireSteamSessionSecret(env: HttpSecurityEnvironment = process.env): string {
  const secret = env.STEAM_SESSION_SECRET;
  if (!secret?.trim() || secret.trim() === 'STEAM_SESSION_SECRET') {
    throw new Error('STEAM_SESSION_SECRET must be configured with a private, non-default value.');
  }
  // Preserve the existing secret byte-for-byte; do not rotate or trim it here.
  return secret;
}
