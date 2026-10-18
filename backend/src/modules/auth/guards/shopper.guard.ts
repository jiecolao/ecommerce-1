import { CanActivate, ExecutionContext, ForbiddenException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../integrations/prisma/prisma.service';
import type { AuthenticatedRequest } from '../auth.types';

@Injectable()
export class ShopperGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.shopperId = undefined;
    if (!request.authenticatedUser) {
      throw new UnauthorizedException('A valid bearer access token is required.');
    }

    let shopper: { id: string } | null;
    try {
      shopper = await this.prisma.shopper.findUnique({
        where: { id: request.authenticatedUser.id },
        select: { id: true },
      });
    } catch {
      throw new ServiceUnavailableException('Account verification is unavailable.');
    }

    if (!shopper) {
      throw new ForbiddenException('A shopper account is required.');
    }

    request.shopperId = shopper.id;
    return true;
  }
}
