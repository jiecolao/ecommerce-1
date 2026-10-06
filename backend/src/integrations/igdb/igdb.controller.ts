import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IgdbService } from './igdb.service';
import { CreateIgdbDto } from './dto/create-igdb.dto';
import { UpdateIgdbDto } from './dto/update-igdb.dto';

@Controller('igdb')
export class IgdbController {
  constructor(private readonly igdbService: IgdbService) {}

  @Post()
  create(@Body() createIgdbDto: CreateIgdbDto) {
    return this.igdbService.create(createIgdbDto);
  }

  @Get()
  findAll() {
    return this.igdbService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.igdbService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIgdbDto: UpdateIgdbDto) {
    return this.igdbService.update(+id, updateIgdbDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.igdbService.remove(+id);
  }
}
