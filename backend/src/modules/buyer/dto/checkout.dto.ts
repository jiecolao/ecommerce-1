import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  productId!: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  totalAmount!: number;

  @IsOptional()
  @IsString()
  discountCode?: string;
}
