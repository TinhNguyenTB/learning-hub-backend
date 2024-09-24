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
    // check course exist
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
      }
    })
  }

  async update(id: string, updateSectionDto: UpdateSectionDto, user: IUser) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id: updateSectionDto.courseId,
        instructorId: user.id
      },
      select: {
        duration: true
      }
    })
    if (!course) {
      return new NotFoundException("Course not found")
    }
    // update section
    const { title, description, videoUrl, isFree, videoDuration } = updateSectionDto
    const section = await this.prisma.section.update({
      where: {
        id,
        courseId: updateSectionDto.courseId
      },
      data: {
        title,
        description,
        videoUrl,
        isFree: isFree ?? false
      }
    })
    // Update course duration
    if (videoUrl && videoUrl !== section.videoUrl) {
      await this.prisma.course.update({
        where: {
          id: updateSectionDto.courseId
        },
        data: {
          duration: course.duration + videoDuration
        }
      })
    }
    return section;
  }

  async reorder(reorderDto: ReorderSectionDto, user: IUser) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id: reorderDto.courseId,
        instructorId: user.id
      }
    })
    if (!course) {
      return new NotFoundException("Course not found")
    }
    // update position of sections
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

  async remove(id: string, courseId: string, user: IUser) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
        instructorId: user.id
      }
    })
    if (!course) {
      return new NotFoundException("Course not found")
    }
    // check section exist
    const section = await this.prisma.section.findUnique({
      where: {
        id,
        courseId
      }
    })
    if (!section) {
      return new NotFoundException("Section not found");
    }
    // find published sections in course
    const publishedSectionsInCourse = await this.prisma.section.findMany({
      where: {
        courseId,
        isPublished: true
      }
    })
    // unpublish course
    if (!publishedSectionsInCourse.length) {
      await this.prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false
        }
      })
    }
    // delete section
    return await this.prisma.section.delete({
      where: {
        id,
        courseId
      }
    })
  }
}
