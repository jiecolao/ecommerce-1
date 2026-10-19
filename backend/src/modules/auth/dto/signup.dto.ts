import { IsIn, IsOptional, IsString } from 'class-validator';
import { LoginDto } from './login.dto';

export class SignupDto extends LoginDto {
  // Existing clients send role: 'buyer'; public signup cannot select admin access.
  @IsOptional()
  @IsIn(['buyer'], { message: 'Public signup only supports buyer accounts.' })
  role?: 'buyer' | null;

  @IsOptional()
  @IsString()
  firstName?: string | null;

  @IsOptional()
  @IsString()
  lastName?: string | null;
}
