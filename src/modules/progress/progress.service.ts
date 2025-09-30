import { Injectable, NotFoundException } from '@nestjs/common';
import { CompletedProgressDto, UpSertProgressDto } from './dto/progress.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async upSert(upSertProgressDto: UpSertProgressDto) {
    const { isCompleted, sectionId, studentId } = upSertProgressDto;
    // check section exist
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId, deleted: false },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    // upsert progress
    const progress = await this.prisma.progress.upsert({
      where: {
        studentId_sectionId: {
          studentId: studentId,
          sectionId: sectionId,
        },
        deleted: false,
      },
      update: {
        isCompleted: isCompleted,
      },
      create: {
        studentId: studentId,
        sectionId: sectionId,
        isCompleted: isCompleted,
      },
    });
    return progress;
  }

  async findAll(completedProgressDto: CompletedProgressDto) {
    return await this.prisma.progress.count({
      where: {
        studentId: completedProgressDto.studentId,
        sectionId: {
          in: completedProgressDto.publishedSectionsId,
        },
        isCompleted: true,
        deleted: false,
      },
    });
  }

  async findOne(studentId: string, sectionId: string) {
    return await this.prisma.progress.findUnique({
      where: {
        studentId_sectionId: {
          studentId,
          sectionId,
        },
      },
    });
  }
}
