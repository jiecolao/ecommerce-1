import { Injectable } from '@nestjs/common';
import { CreateIgdbDto } from './dto/create-igdb.dto';
import { UpdateIgdbDto } from './dto/update-igdb.dto';

@Injectable()
export class IgdbService {
  create(createIgdbDto: CreateIgdbDto) {
    return 'This action adds a new igdb';
  }

  findAll() {
    return `This action returns all igdb`;
  }

  findOne(id: number) {
    return `This action returns a #${id} igdb`;
  }

  update(id: number, updateIgdbDto: UpdateIgdbDto) {
    return `This action updates a #${id} igdb`;
  }

  remove(id: number) {
    return `This action removes a #${id} igdb`;
  }
}
