import { Injectable, BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, InternalServerErrorException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AuthError } from '@supabase/supabase-js';
import type { AuthenticatedUser } from './auth.types';
import type { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private readonly supabaseConfigured: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SECRET_KEY') || this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY');
    this.supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or Key not provided in backend environment variables.');
    }

    this.supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  async verifyAccessToken(accessToken: string): Promise<AuthenticatedUser> {
    return { id: (await this.getVerifiedUser(accessToken)).id };
  }

  private async getVerifiedUser(accessToken: string) {
    // Always verify this request's token, never the client's last login session.
    const result = await this.requestAuth(() => this.supabase.auth.getUser(accessToken), 'verification');

    if (result.error) {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    const user = result.data.user;
    if (!user || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    return user;
  }

  async signup(body: SignupDto) {
    const { email, password, firstName, lastName } = body;
    
    // 1. Create in Supabase Auth
    const { data, error } = await this.requestAuth(() => this.supabase.auth.signUp({
      email,
      password,
      options: {
        // The team owns all seller/admin accounts; public accounts are buyers.
        data: { role: 'buyer', first_name: firstName, last_name: lastName }
      }
    }), 'credentials');

    if (error) {
      throw new BadRequestException('Unable to create account. Please check your details and try again.');
    }

    if (!data.user) {
      throw new InternalServerErrorException('User creation failed in Supabase');
    }

    // The authenticated buyer-profile operation completes application signup.
    // A signup response alone does not establish ownership of that identity;
    // profile creation requires a verified signed-in session.
    
    return { message: 'User created successfully', user: data.user, session: data.session };
  }

  async getAccountContext(id: string) {
    const account = await this.findAccountContext(id);
    if (!account) throw new ForbiddenException('This account is not set up for access.');
    return account;
  }

  private async findAccountContext(id: string) {
    let admin: { id: string } | null;
    let shopper: { id: string } | null;
    try {
      [admin, shopper] = await Promise.all([
        this.prisma.admin.findUnique({ where: { id }, select: { id: true } }),
        this.prisma.shopper.findUnique({ where: { id }, select: { id: true } }),
      ]);
    } catch {
      throw new ServiceUnavailableException('Account verification is unavailable.');
    }
    if (!admin && !shopper) return null;
    // UI routing reflects the same existing memberships enforced by the guards.
    return { id, role: admin ? 'admin' as const : 'buyer' as const, isAdmin: Boolean(admin), isBuyer: Boolean(shopper) };
  }

  async provisionBuyerProfile(id: string, accessToken: string) {
    const existing = await this.findAccountContext(id);
    if (existing) return existing;

    // Reuse Auth's verified profile only when creating a new row. Existing
    // memberships are never overwritten, and editable metadata cannot grant roles.
    const user = await this.getVerifiedUser(accessToken);
    if (user.id !== id) throw new UnauthorizedException('Invalid or expired access token.');
    const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
    if (user.is_anonymous || !email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ForbiddenException('A signed-in email account is required.');
    }
    const conflict = () => new ConflictException('This account profile could not be set up. Please contact your project administrator.');
    try {
      const emailLookup = { where: { email: { equals: email, mode: 'insensitive' as const } }, select: { id: true as const } };
      const sameEmail = await Promise.all([
        this.prisma.shopper.findFirst(emailLookup), this.prisma.admin.findFirst(emailLookup),
      ]);
      if (sameEmail.some(account => account && account.id !== id)) throw conflict();
      const name = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 255) : '';
      await this.prisma.shopper.create({
        data: {
          id, email,
          firstName: name(user.user_metadata?.first_name),
          lastName: name(user.user_metadata?.last_name),
          username: `buyer_${id.replace(/-/g, '')}`,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        // A concurrent request/trigger may already have created this exact
        // identity. Unique email/username collisions never relink another user.
        const concurrent = await this.findAccountContext(id);
        if (concurrent) return concurrent;
        throw conflict();
      }
      throw new ServiceUnavailableException('Account verification is unavailable.');
    }
    return this.getAccountContext(id);
  }

  async login(email: string, password: string) {
    const { data, error } = await this.requestAuth(() => this.supabase.auth.signInWithPassword({
      email,
      password,
    }), 'credentials');

    if (error) {
      throw new BadRequestException('Unable to sign in. Please check your credentials and try again.');
    }

    if (!data.user || !data.session) {
      throw new ServiceUnavailableException('Authentication service is unavailable.');
    }

    return { session: data.session, user: data.user };
  }

  private async requestAuth<T extends { error: AuthError | null }>(
    request: () => Promise<T>,
    operation: 'credentials' | 'verification',
  ): Promise<T> {
    if (!this.supabaseConfigured) {
      throw new ServiceUnavailableException('Authentication service is unavailable.');
    }

    let result: T;
    try {
      result = await request();
    } catch {
      throw new ServiceUnavailableException('Authentication service is unavailable.');
    }

    const error = result.error;
    if (error?.status === HttpStatus.TOO_MANY_REQUESTS) {
      // A throttled identity lookup cannot establish whether this token is valid.
      if (operation === 'verification') {
        throw new ServiceUnavailableException('Authentication service is unavailable.');
      }
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many authentication requests. Please try again later.',
      }, HttpStatus.TOO_MANY_REQUESTS);
    }
    if (error && (error.name === 'AuthRetryableFetchError' || error.status === 0 || (error.status ?? 0) >= 500)) {
      throw new ServiceUnavailableException('Authentication service is unavailable.');
    }
    return result;
  }
}
