import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import type { AuthenticatedRequest } from '../auth.types';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.authenticatedUser = undefined;
    request.shopperId = undefined;
    request.adminId = undefined;

    const authorization = request.headers.authorization;
    const match = typeof authorization === 'string'
      ? /^Bearer[ \t]+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)[ \t]*$/i.exec(authorization)
      : null;

    if (!match) {
      throw new UnauthorizedException('A valid bearer access token is required.');
    }

    request.authenticatedUser = await this.authService.verifyAccessToken(match[1]);
    return true;
  }
}
