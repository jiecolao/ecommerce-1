import { PartialType } from '@nestjs/mapped-types';
import { CreateRawgDto } from './create-rawg.dto';

export class UpdateRawgDto extends PartialType(CreateRawgDto) {}
