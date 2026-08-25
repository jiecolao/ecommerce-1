import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(token: string, role: string, firstName: string, lastName: string) {
    try {
      const decoded = jwtDecode<{ sub: string; email: string }>(token);
      
      if (!decoded.sub || !decoded.email) {
        throw new BadRequestException('Invalid token payload');
      }

      if (role === 'admin') {
        const admin = await this.prisma.admin.create({
          data: {
            id: decoded.sub,
            email: decoded.email,
            name: `${firstName} ${lastName}`.trim(),
          }
        });
        return { message: 'Admin profile created', id: admin.id };
      } else {
        const buyer = await this.prisma.buyer.create({
          data: {
            id: decoded.sub,
            email: decoded.email,
            firstName,
            lastName,
          }
        });
        return { message: 'Buyer profile created', id: buyer.id };
      }
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Failed to sync user: ' + e.message);
    }
  }
}
