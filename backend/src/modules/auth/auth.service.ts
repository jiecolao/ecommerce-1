import { Injectable, BadRequestException, InternalServerErrorException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AuthenticatedUser } from './auth.types';

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
    if (!this.supabaseConfigured) {
      throw new ServiceUnavailableException('Authentication service is unavailable.');
    }

    let result: Awaited<ReturnType<SupabaseClient['auth']['getUser']>>;
    try {
      // Always verify this request's token, never the client's last login session.
      result = await this.supabase.auth.getUser(accessToken);
    } catch {
      throw new ServiceUnavailableException('Authentication service is unavailable.');
    }

    if (result.error) {
      if (result.error.name === 'AuthRetryableFetchError' || result.error.status === 0 || (result.error.status ?? 0) >= 500) {
        throw new ServiceUnavailableException('Authentication service is unavailable.');
      }
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    const user = result.data.user;
    if (!user || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    return { id: user.id };
  }

  async signup(body: any) {
    const { email, password, role, firstName, lastName } = body;
    
    // 1. Create in Supabase Auth
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, first_name: firstName, last_name: lastName }
      }
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new InternalServerErrorException('User creation failed in Supabase');
    }

    // 2. Sync to Prisma Database is now handled by a PostgreSQL Trigger on auth.users
    
    return { message: 'User created successfully', user: data.user, session: data.session };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { session: data.session, user: data.user };
  }
}
