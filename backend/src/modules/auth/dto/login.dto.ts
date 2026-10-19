import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  // Preserve password contents and leave password policy to Supabase Auth.
  @IsString()
  @IsNotEmpty()
  password!: string;
}
