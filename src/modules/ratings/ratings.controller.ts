import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ResponseMessage, User } from '@/decorator/customize';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) { }

  @ResponseMessage("Create a rate for course")
  @Post()
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingsService.create(createRatingDto);
  }

  @ResponseMessage("Get all rate pagination")
  @Get()
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('courseId') courseId: string,
    @User() user: IUser
  ) {
    return this.ratingsService.findAll(+current, +pageSize, courseId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratingsService.findOne(+id);
  }

  @ResponseMessage("Update a rate")
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingsService.update(id, updateRatingDto);
  }

  @ResponseMessage("Delete a rate")
  @Delete(':id')
  remove(@Param('id') id: string, @Body("courseId") courseId: string) {
    return this.ratingsService.remove(id, courseId);
  }
}
