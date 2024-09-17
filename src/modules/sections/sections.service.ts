import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { ReorderSectionDto, UpdateSectionDto } from './dto/update-section.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class SectionsService {
  constructor(
    private prisma: PrismaService
  ) { }

  async create(createSectionDto: CreateSectionDto, user: IUser) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: createSectionDto.courseId,
        instructorId: user.id
      }
    })
    if (!course) {
      return new NotFoundException("Course not found")
    }
    const lastSection = await this.prisma.section.findFirst({
      where: {
        courseId: course.id,
      },
      orderBy: {
        position: 'desc'
      }
    })

    const newPosition = lastSection ? lastSection.position + 1 : 0

    return await this.prisma.section.create({
      data: {
        title: createSectionDto.title,
        courseId: course.id,
        position: newPosition
      }
    })
  }

  findAll() {
    return `This action returns all sections`;
  }

  async findOne(id: string, courseId: string) {
    return await this.prisma.section.findUnique({
      where: {
        id,
        courseId
      },
      include: {
        resources: true,
        video: true
      }
    })
  }

  async update(id: string, updateSectionDto: UpdateSectionDto, user: IUser) {
    return `This action updates a #${id} section`;
  }

  async reorder(reorderDto: ReorderSectionDto, user: IUser) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: reorderDto.courseId,
        instructorId: user.id
      }
    })
    if (!course) {
      return new NotFoundException("Course not found")
    }
    for (let item of reorderDto.list) {
      await this.prisma.section.update({
        where: {
          id: item.id
        },
        data: {
          position: item.position,
        },
      });
    }
    return {
      message: "Reorder sections successfully"
    }
  }

  remove(id: number) {
    return `This action removes a #${id} section`;
  }
}
