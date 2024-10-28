import { Injectable } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) { }

  create(createProgressDto: CreateProgressDto) {
    return 'This action adds a new progress';
  }

  findAll() {
    return `This action returns all progress`;
  }

  async findOne(studentId: string, sectionId: string) {
    return await this.prisma.progress.findUnique({
      where: {
        studentId_sectionId: {
          studentId,
          sectionId
        }
      }
    })
  }

  update(id: number, updateProgressDto: UpdateProgressDto) {
    return `This action updates a #${id} progress`;
  }

  remove(id: number) {
    return `This action removes a #${id} progress`;
  }
}
