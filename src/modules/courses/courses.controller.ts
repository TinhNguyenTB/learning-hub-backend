import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ResponseMessage, User } from '@/decorator/customize';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Post()
  @ResponseMessage("Create a new course")
  create(@Body() createCourseDto: CreateCourseDto, @User() user: IUser) {
    return this.coursesService.create(createCourseDto, user);
  }

  @Get()
  @ResponseMessage("Get courses pagination")
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @User() user: IUser
  ) {
    return this.coursesService.findAll(+page, +limit, search, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser) {
    return this.coursesService.findOne(id, user);
  }

  @ResponseMessage("Update course")
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @User() user: IUser) {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}
