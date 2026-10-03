import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SteamUser } from '/'


export interface SteamProfile {
  steamId: string;
  personaName?: string;
  avatar?: string;
  profileUrl?: string;
}

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

  async validateOrCreateSteamUser(steamProfile: SteamProfile) {
    if (!steamProfile || !steamProfile.steamId) {
      throw new Error('Invalid Steam user profile');
    }

    // Example logic using Prisma (adjust model/field names to your schema.prisma):
    /*
    let user = await this.prisma.user.findUnique({
      where: { steamId: steamProfile.steamId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          steamId: steamProfile.steamId,
          username: steamProfile.personaName || `SteamUser_${steamProfile.steamId}`,
          avatarUrl: steamProfile.avatar,
        },
      });
    }

    return user;
    */

    return {
      steamId: steamProfile.steamId,
      personaName: steamProfile.personaName,
      avatar: steamProfile.avatar,
    };
  }
}
