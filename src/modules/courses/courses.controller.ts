import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { PublishCourseDto, UpdateCourseDto } from './dto/update-course.dto';
import { Public, ResponseMessage, User } from '@/decorator/customize';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Post()
  @ResponseMessage("Create a new course")
  create(@Body() createCourseDto: CreateCourseDto, @User() user: IUser) {
    return this.coursesService.create(createCourseDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage("Get courses pagination")
  findAllPagination(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('categoryId') categoryId: string,
    @Query('search') search: string,
  ) {
    return this.coursesService.findAllPagination(+current, +pageSize, categoryId, search);
  }

  @Get("instructor")
  @ResponseMessage("Get courses for instructor")
  findAll(@User() user: IUser) {
    return this.coursesService.findAll(user);
  }

  @ResponseMessage("Get course by id for instructor")
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser) {
    return this.coursesService.findOne(id, user);
  }

  @Public()
  @ResponseMessage("Get course by id for student")
  @Get(':id/published')
  findOneForStudent(@Param('id') id: string) {
    return this.coursesService.findOneForStudent(id);
  }

  @ResponseMessage("Update course")
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @User() user: IUser) {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @ResponseMessage("Delete course by id")
  @Delete()
  remove(@Body("courseId") courseId: string) {
    return this.coursesService.remove(courseId);
  }

  @Post("publish")
  @ResponseMessage("Publish a course")
  publish(@Body() publishCourseDto: PublishCourseDto, @User() user: IUser) {
    return this.coursesService.publish(publishCourseDto, user);
  }
}
