import { CanActivate, ExecutionContext, ForbiddenException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../integrations/prisma/prisma.service';
import type { AuthenticatedRequest } from '../auth.types';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.adminId = undefined;
    if (!request.authenticatedUser) {
      throw new UnauthorizedException('A valid bearer access token is required.');
    }

    let admin: { id: string } | null;
    try {
      admin = await this.prisma.admin.findUnique({
        where: { id: request.authenticatedUser.id },
        select: { id: true },
      });
    } catch {
      throw new ServiceUnavailableException('Account verification is unavailable.');
    }

    if (!admin) {
      throw new ForbiddenException('Administrator access is required.');
    }

    request.adminId = admin.id;
    return true;
  }
}
