import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SECRET_KEY') || this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or Key not provided in backend environment variables.');
    }

    this.supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
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

    const userId = data.user.id;

    // 2. Sync to Prisma Database
    try {
      if (role === 'admin') {
        await this.prisma.admin.create({
          data: {
            id: userId,
            email: email,
            name: `${firstName} ${lastName}`.trim(),
          }
        });
      } else {
        await this.prisma.customer.create({
          data: {
            id: userId,
            email: email,
            firstName,
            lastName,
          }
        });
      }
    } catch (e: any) {
      // Note: Ideally, if this fails, we would roll back the Supabase user creation via admin API.
      console.error('Failed to sync user to Prisma:', e.message);
    }

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
