import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Public, ResponseMessage } from '@/decorator/customize';

@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) { }

  @Post()
  @Public()
  @ResponseMessage("Create a new level")
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelsService.create(createLevelDto);
  }

  @Get()
  @Public()
  @ResponseMessage("Get all levels")
  findAll() {
    return this.levelsService.findAll();
  }

  @Public()
  @ResponseMessage("Get level by id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.levelsService.findOne(id);
  }

  @Patch(':id')
  @Public()
  @ResponseMessage("Update level by id")
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelsService.update(id, updateLevelDto);
  }

  @Delete(':id')
  @Public()
  @ResponseMessage("Delete level by id")
  remove(@Param('id') id: string) {
    return this.levelsService.remove(id);
  }
}
