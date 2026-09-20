import { IsString } from 'class-validator'

export class OpencriticReviewsDTO {
  @IsString()
  username!: string;

  @IsString()
  review!: string;

  
} 