import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { ChangeStatusCourseDto, PublishCourseDto, UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '@/prisma.service';
import { validateFields } from '@/helpers/utils';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { ConfigService } from '@nestjs/config';
import { courseStatus } from '@/lib/constants';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) { }

  async checkCourseExistsByTitle(title: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        title,
        deleted: false
      }
    })
    if (course) {
      throw new BadRequestException(`Course ${title} already exists`)
    }
    return false
  }

  async checkCourseExistsById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
        deleted: false
      }
    })
    if (!course) {
      throw new BadRequestException("Course not found")
    }
    return true
  }

  async create(createCourseDto: CreateCourseDto, user: IUser) {
    const { title, categoryId, subCategoryId } = createCourseDto;
    const isExist = await this.checkCourseExistsByTitle(title);
    if (isExist === false) {
      const newCourse = await this.prisma.course.create({
        data: {
          title,
          categoryId,
          subCategoryId,
          instructorId: user.id,
          statusName: courseStatus.PENDING
        }
      })
      return {
        id: newCourse.id
      }
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
          { deleted: false },
          { isPublished: true }
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
          { deleted: false },
          { isPublished: true }
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
        instructorId: user.id,
        deleted: false
      }
    })
  }

  async findFeatured() {
    return await this.prisma.course.findMany({
      take: 4,
      where: {
        deleted: false,
        isPublished: true
      },
      include: {
        level: {
          select: {
            name: true,
            id: true
          }
        },
        instructor: {
          select: {
            name: true,
            id: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findOne(id: string, user: IUser) {
    return await this.prisma.course.findUnique({
      where: {
        id,
        instructorId: user.id,
        deleted: false
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
        id,
        deleted: false,
        isPublished: true
      },
      include: {
        sections: {
          where: {
            isPublished: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        instructor: true
      }
    })
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user: IUser) {
    const isExist = await this.checkCourseExistsById(id);
    if (isExist) {
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
  }

  async remove(courseId: string) {
    // check course exist
    const isExist = await this.checkCourseExistsById(courseId);
    if (isExist) {
      const course = await this.prisma.course.update({
        where: {
          id: courseId
        },
        data: { deleted: true }
      })
      return {
        deleted: course.deleted
      }
    }
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
    const isExist = await this.checkCourseExistsById(data.id);
    if (isExist) {
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

  async checkout(id: string, user: IUser) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id,
        deleted: false,
        isPublished: true
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    // check purchase exist
    const purchase = await this.prisma.purchase.findUnique({
      where: {
        customerId_courseId: { courseId: course.id, customerId: user.id }
      }
    })
    if (purchase) {
      throw new BadRequestException("Course already purchase")
    }
    // create line_items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title
          },
          unit_amount: Math.round(course.price * 100)
        }
      }
    ]
    // create stripe_customer
    let stripe_customer = await this.prisma.stripeCustomer.findUnique({
      where: {
        customerId: user.id
      },
      select: {
        stripeCustomerId: true
      }
    })
    if (!stripe_customer) {
      const customer = await stripe.customers.create({
        email: user.email
      });
      stripe_customer = await this.prisma.stripeCustomer.create({
        data: {
          customerId: user.id,
          stripeCustomerId: customer.id
        }
      })
    }
    // create payment session
    const frontendUrl = this.configService.get<string>("FRONTEND_URL")
    const session = await stripe.checkout.sessions.create({
      customer: stripe_customer.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${frontendUrl}/courses/${course.id}/overview?success=true`,
      cancel_url: `${frontendUrl}/courses/${course.id}/overview?canceled=true`,
      metadata: {
        courseId: course.id,
        customerId: user.id
      }
    })
    return {
      url: session.url
    }
  }
}
