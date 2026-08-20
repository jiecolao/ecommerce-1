import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

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
  storePage?: string;

  @IsInt()
  price!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keys?: string[];
}

export class CreateSellerProductDto {
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
  @IsArray()
  @IsString({ each: true })
  media?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}

export class UpdateSellerProductDto {
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
