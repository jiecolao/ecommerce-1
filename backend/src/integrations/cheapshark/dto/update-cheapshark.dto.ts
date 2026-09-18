import { PartialType } from '@nestjs/mapped-types';
import { CreateCheapsharkDto } from './create-cheapshark.dto';

export class UpdateCheapsharkDto extends PartialType(CreateCheapsharkDto) {}
