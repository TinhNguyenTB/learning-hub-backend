import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) { }

  async create(createRatingDto: CreateRatingDto) {
    const { content, courseId, quality, userId } = createRatingDto;
    const rate = await this.prisma.rating.findFirst({
      where: { userId }
    })
    if (rate) {
      throw new BadRequestException("Rate already exist")
    }

    const result = await this.prisma.rating.create({
      data: {
        content,
        courseId,
        quality,
        userId
      }
    })
    const ratings = await this.prisma.rating.findMany({
      where: { courseId },
    });
    const averageRating = ratings.reduce((acc, curr) => acc + curr.quality, 0) / ratings.length;
    // Update the course with the new average rating
    await this.prisma.course.update({
      where: { id: courseId },
      data: { averageRating },
    });

    return result
  }

  async findAll(current: number, pageSize: number, courseId: string, user: IUser) {
    if (!current || current < 1) current = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;

    const skip = current > 1 ? (current - 1) * pageSize : 0;

    const total = await this.prisma.rating.count({
      where: { courseId, deleted: false }
    });

    const result = await this.prisma.rating.findMany({
      take: pageSize,
      skip: skip,
      where: { courseId },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    const hasRated = await this.prisma.rating.findFirst({
      where: { userId: user.id }
    })
    const totalPages = Math.ceil(total / pageSize);

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: total
      },
      result,
      hasRated: hasRated ? true : false
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} rating`;
  }

  async update(id: string, updateRatingDto: UpdateRatingDto) {
    const rate = await this.prisma.rating.findUnique({
      where: { id }
    })
    if (!rate) {
      throw new BadRequestException("Rate not found")
    }

    const { content, quality, courseId } = updateRatingDto
    const result = await this.prisma.rating.update({
      where: { id },
      data: {
        content,
        quality
      }
    })
    const ratings = await this.prisma.rating.findMany({
      where: { courseId },
    });
    const averageRating = ratings.reduce((acc, curr) => acc + curr.quality, 0) / ratings.length;
    // Update the course with the new average rating
    await this.prisma.course.update({
      where: { id: courseId },
      data: { averageRating },
    });
    return result;
  }

  async remove(id: string, courseId: string) {
    const rate = await this.prisma.rating.findUnique({
      where: { id }
    })
    if (!rate) {
      throw new BadRequestException("Rate not found")
    }
    const result = await this.prisma.rating.delete({
      where: { id },
    })

    const ratings = await this.prisma.rating.findMany({
      where: { courseId },
    });
    let averageRating = 0;
    if (ratings.length > 0) {
      averageRating = ratings.reduce((acc, curr) => acc + curr.quality, 0) / ratings.length;
    }
    // Update the course with the new average rating
    await this.prisma.course.update({
      where: { id: courseId },
      data: { averageRating },
    });
    return result;
  }
}
