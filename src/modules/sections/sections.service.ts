import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { PublishSectionDto, ReorderSectionDto, UpdateSectionDto } from './dto/update-section.dto';
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
        instructorId: user.id,
        deleted: false
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
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

  async findAll(courseId: string) {
    if (!courseId) {
      throw new BadRequestException("courseId cannot be empty")
    }
    return this.prisma.section.findMany({
      where: {
        courseId,
        isPublished: true,
        deleted: false
      },
      orderBy: {
        position: 'asc'
      }
    })
  }

  async findOne(id: string, courseId: string) {
    return await this.prisma.section.findUnique({
      where: {
        id,
        courseId,
        deleted: false
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
        instructorId: user.id,
        deleted: false
      },
      select: {
        duration: true
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    // update section
    const { title, description, videoUrl, isFree, videoDuration } = updateSectionDto
    const section = await this.prisma.section.update({
      where: {
        id,
        courseId: updateSectionDto.courseId,
        deleted: false
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
          id: updateSectionDto.courseId,
          deleted: false
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
        instructorId: user.id,
        deleted: false
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
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
        instructorId: user.id,
        deleted: false
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    // check section exist
    let section = await this.prisma.section.findUnique({
      where: {
        id,
        courseId,
        deleted: false
      }
    })
    if (!section) {
      throw new NotFoundException("Section not found");
    }
    // find published sections in course
    const publishedSectionsInCourse = await this.prisma.section.findMany({
      where: {
        courseId,
        isPublished: true,
        deleted: false
      }
    })
    // unpublish course
    if (!publishedSectionsInCourse.length) {
      await this.prisma.course.update({
        where: {
          id: courseId,
          deleted: false
        },
        data: {
          isPublished: false
        }
      })
    }
    // delete section
    section = await this.prisma.section.update({
      where: {
        id,
        courseId,
        deleted: false
      },
      data: { deleted: true }
    })
    return {
      deleted: section.deleted
    }
  }

  async publish(publishSectionDto: PublishSectionDto, user: IUser) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id: publishSectionDto.courseId,
        deleted: false,
        instructorId: user.id
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    // check section exist
    const section = await this.prisma.section.findUnique({
      where: {
        id: publishSectionDto.sectionId,
        deleted: false,
        courseId: publishSectionDto.courseId
      }
    })
    if (!section) {
      throw new NotFoundException("Section not found")
    }
    if (!section.title || !section.description || !section.videoUrl) {
      throw new BadRequestException("Missing required fields")
    }
    return await this.prisma.section.update({
      where: {
        id: publishSectionDto.sectionId,
        deleted: false,
        courseId: publishSectionDto.courseId
      },
      data: {
        isPublished: publishSectionDto.isPublish
      }
    })
  }

}
