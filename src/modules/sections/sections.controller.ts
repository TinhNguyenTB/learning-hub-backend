import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ResponseMessage, User } from '@/decorator/customize';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) { }

  @ResponseMessage("Create a new section")
  @Post()
  create(@Body() createSectionDto: CreateSectionDto, @User() user: IUser) {
    return this.sectionsService.create(createSectionDto, user);
  }

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(+id, updateSectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(+id);
  }
}
