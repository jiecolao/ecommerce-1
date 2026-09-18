import { Injectable } from '@nestjs/common';
import { CreateCheapsharkDto } from './dto/create-cheapshark.dto';
import { UpdateCheapsharkDto } from './dto/update-cheapshark.dto';

@Injectable()
export class CheapsharkService {
  create(createCheapsharkDto: CreateCheapsharkDto) {
    return 'This action adds a new cheapshark';
  }

  findAll() {
    return `This action returns all cheapshark`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cheapshark`;
  }

  update(id: number, updateCheapsharkDto: UpdateCheapsharkDto) {
    return `This action updates a #${id} cheapshark`;
  }

  remove(id: number) {
    return `This action removes a #${id} cheapshark`;
  }
}
