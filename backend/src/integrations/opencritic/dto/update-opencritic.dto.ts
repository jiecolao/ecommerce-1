import { PartialType } from '@nestjs/mapped-types';
import { CreateOpencriticDto } from './create-opencritic.dto';

export class UpdateOpencriticDto extends PartialType(CreateOpencriticDto) {}
