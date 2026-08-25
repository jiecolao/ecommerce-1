import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  developer?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  systemRequirements?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media?: string[];
}



