import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RawgService } from './rawg.service';
import { CreateRawgDto } from './dto/create-rawg.dto';
import { UpdateRawgDto } from './dto/update-rawg.dto';

@Controller('rawg')
export class RawgController {
  constructor(private readonly rawgService: RawgService) {}

  @Post()
  create(@Body() createRawgDto: CreateRawgDto) {
    return this.rawgService.create(createRawgDto);
  }

  @Get()
  findAll() {
    return this.rawgService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rawgService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRawgDto: UpdateRawgDto) {
    return this.rawgService.update(+id, updateRawgDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rawgService.remove(+id);
  }
}
