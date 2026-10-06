import { Injectable } from '@nestjs/common';
import { CreateRawgDto } from './dto/create-rawg.dto';
import { UpdateRawgDto } from './dto/update-rawg.dto';

@Injectable()
export class RawgService {
  create(createRawgDto: CreateRawgDto) {
    return 'This action adds a new rawg';
  }

  findAll() {
    return `This action returns all rawg`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rawg`;
  }

  update(id: number, updateRawgDto: UpdateRawgDto) {
    return `This action updates a #${id} rawg`;
  }

  remove(id: number) {
    return `This action removes a #${id} rawg`;
  }
}
