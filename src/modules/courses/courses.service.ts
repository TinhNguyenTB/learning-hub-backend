import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { PublishCourseDto, UpdateCourseDto } from './dto/update-course.dto';
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

  async findAll(page: number, limit: number, search: string, user: IUser) {
    if (!page) page = 1;
    if (!limit) limit = 10;
    if (!search) search = ""
    const skip = page > 1 ? (page - 1) * limit : 0;
    const result = await this.prisma.course.findMany({
      take: limit,
      skip: skip,
      where: {
        OR: [
          {
            title: { contains: search }
          },
          {
            subTitle: { contains: search }
          }
        ],
        AND: [
          {
            instructorId: user.id
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    const total = result.length;
    const totalPages = Math.ceil(total / limit);

    return {
      meta: {
        current: page, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: total // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
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

}
