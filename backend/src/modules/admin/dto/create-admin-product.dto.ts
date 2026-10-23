import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class CreateProductVariantDto {
  @IsInt()
  storeId!: number;

  @IsInt()
  typeId!: number;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsInt()
  region!: number;

  @IsArray()
  @IsString({ each: true })
  languageSupport!: string[];

  @IsOptional()
  @IsString()
  activationGuide?: string;

  @IsOptional()
  @IsString()
  storePage?: string;

  @IsInt()
  price!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keys?: string[];
}

export class CreateAdminProductDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  description!: string;

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
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  rating?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media?: string[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  featuredImageIndex?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}



