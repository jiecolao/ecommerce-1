import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CheapsharkService } from './cheapshark.service';
import { CreateCheapsharkDto } from './dto/create-cheapshark.dto';
import { UpdateCheapsharkDto } from './dto/update-cheapshark.dto';

@Controller('cheapshark')
export class CheapsharkController {
  constructor(private readonly cheapsharkService: CheapsharkService) {}

  @Post()
  create(@Body() createCheapsharkDto: CreateCheapsharkDto) {
    return this.cheapsharkService.create(createCheapsharkDto);
  }

  @Get()
  findAll() {
    return this.cheapsharkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cheapsharkService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCheapsharkDto: UpdateCheapsharkDto) {
    return this.cheapsharkService.update(+id, updateCheapsharkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cheapsharkService.remove(+id);
  }
}
