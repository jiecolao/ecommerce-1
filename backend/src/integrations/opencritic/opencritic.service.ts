import { Injectable } from '@nestjs/common';
import { CreateOpencriticDto } from './dto/create-opencritic.dto';
import { UpdateOpencriticDto } from './dto/update-opencritic.dto';

@Injectable()
export class OpencriticService {
  create(createOpencriticDto: CreateOpencriticDto) {
    return 'This action adds a new opencritic';
  }

  findAll() {
    return `This action returns all opencritic`;
  }

  findOne(id: number) {
    return `This action returns a #${id} opencritic`;
  }

  update(id: number, updateOpencriticDto: UpdateOpencriticDto) {
    return `This action updates a #${id} opencritic`;
  }

  remove(id: number) {
    return `This action removes a #${id} opencritic`;
  }
}
