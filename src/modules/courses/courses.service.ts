import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { ChangeStatusCourseDto, PublishCourseDto, UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '@/prisma.service';
import { validateFields } from '@/helpers/utils';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async create(createCourseDto: CreateCourseDto, user: IUser) {
    const { title, categoryId, subCategoryId } = createCourseDto;
    const newCourse = await this.prisma.course.create({
      data: {
        title,
        categoryId,
        subCategoryId,
        instructorId: user.id,
        statusName: "PENDING"
      }
    })
    return {
      id: newCourse.id
    }
  }

  async findAllPagination(current: number, pageSize: number, categoryId: string, search: string) {
    if (!current || current < 1) current = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;
    if (!search) search = "";

    const skip = current > 1 ? (current - 1) * pageSize : 0;

    const total = await this.prisma.course.count({
      where: {
        OR: [
          { title: { contains: search } },
          { category: { name: { contains: search } } },
          { subCategory: { name: { contains: search } } },
        ],
        AND: [
          // { statusName: "APPROVED" },
          ...(categoryId ? [{ categoryId }] : []),
          // { isPublished: true }
        ]
      },
    });

    const result = await this.prisma.course.findMany({
      take: pageSize,
      skip: skip,
      where: {
        OR: [
          { title: { contains: search } },
          { category: { name: { contains: search } } },
          { subCategory: { name: { contains: search } } },
        ],
        AND: [
          // { statusName: "APPROVED" },
          ...(categoryId ? [{ categoryId }] : []),
          // { isPublished: true }
        ]
      },
      include: {
        category: {
          select: {
            name: true,
            id: true
          }
        },
        instructor: {
          select: {
            name: true,
            id: true
          }
        },
        subCategory: {
          select: {
            name: true,
            id: true
          }
        },
        level: {
          select: {
            name: true,
            id: true
          }
        },
        sections: {
          where: {
            isPublished: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const totalPages = Math.ceil(total / pageSize);

    return {
      meta: {
        current: current, //trang hiện tại
        pageSize: pageSize, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: total // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findAll(user: IUser) {
    return await this.prisma.course.findMany({
      where: {
        instructorId: user.id
      }
    })
  }

  async findOne(id: string, user: IUser) {
    return await this.prisma.course.findUnique({
      where: {
        id,
        instructorId: user.id
      },
      include: {
        sections: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    })
  }

  async findOneForStudent(id: string) {
    return await this.prisma.course.findUnique({
      where: {
        id
      },
      include: {
        sections: {
          where: {
            isPublished: true
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    })
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user: IUser) {
    return await this.prisma.course.update({
      where: {
        id,
        instructorId: user.id
      },
      data: {
        ...updateCourseDto
      }
    })
  }

  async remove(courseId: string) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId
      },
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }

    return await this.prisma.course.delete({
      where: {
        id: courseId
      }
    })
  }

  async publish(publishCourseDto: PublishCourseDto, user: IUser) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id: publishCourseDto.courseId,
        instructorId: user.id
      },
      include: {
        sections: true
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    // check course validity before publishing
    const isPublishedSections = course.sections.some(section => section.isPublished);
    if (!isPublishedSections) {
      throw new BadRequestException("This course does not have any published section")
    }

    const requiredFields = ['title', 'description', 'categoryId', 'subCategoryId', 'levelId', 'imageUrl', 'price'];
    const isValid = validateFields(course, requiredFields);

    if (isValid) {
      return await this.prisma.course.update({
        where: {
          id: publishCourseDto.courseId,
          instructorId: user.id
        },
        data: {
          isPublished: publishCourseDto.isPublish,
        }
      })
    }
  }

  async changeStatus(data: ChangeStatusCourseDto) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id: data.id
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    return await this.prisma.course.update({
      where: {
        id: data.id
      },
      data: {
        statusName: data.statusName
      }
    })
  }

}
