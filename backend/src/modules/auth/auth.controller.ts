import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  async syncUser(
    @Headers('authorization') authHeader: string,
    @Body() body: { role: string; firstName: string; lastName: string }
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    const token = authHeader.split(' ')[1];
    return this.authService.syncUser(token, body.role, body.firstName, body.lastName);
  }
}
