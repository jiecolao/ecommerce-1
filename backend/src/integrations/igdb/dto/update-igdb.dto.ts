import { PartialType } from '@nestjs/mapped-types';
import { CreateIgdbDto } from './create-igdb.dto';

export class UpdateIgdbDto extends PartialType(CreateIgdbDto) {}
