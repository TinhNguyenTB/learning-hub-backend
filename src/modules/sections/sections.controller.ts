import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { ReorderSectionDto, UpdateSectionDto } from './dto/update-section.dto';
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

  @ResponseMessage("Get section by id")
  @Get(':id')
  findOne(@Param('id') id: string, @Body("courseId") courseId: string) {
    return this.sectionsService.findOne(id, courseId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto, @User() user: IUser) {
    return this.sectionsService.update(id, updateSectionDto, user);
  }

  @ResponseMessage("Reorder section")
  @Put("reorder")
  reorder(@Body() reorderDto: ReorderSectionDto, @User() user: IUser) {
    return this.sectionsService.reorder(reorderDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(+id);
  }
}
