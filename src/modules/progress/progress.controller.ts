import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CompletedProgressDto, UpSertProgressDto } from './dto/progress.dto';
import { ResponseMessage } from '@/decorator/customize';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @ResponseMessage('UpSert progress by studentId and sectionId')
  @Post('upsert')
  upSert(@Body() upSertProgressDto: UpSertProgressDto) {
    return this.progressService.upSert(upSertProgressDto);
  }

  @ResponseMessage('Count completed progress by sectionId')
  @Post('count-completed')
  findAll(@Body() completedProgressDto: CompletedProgressDto) {
    return this.progressService.findAll(completedProgressDto);
  }

  @ResponseMessage('Get progress by studentId and sectionId')
  @Get()
  findOne(
    @Query('studentId') studentId: string,
    @Query('sectionId') sectionId: string,
  ) {
    return this.progressService.findOne(studentId, sectionId);
  }
}
