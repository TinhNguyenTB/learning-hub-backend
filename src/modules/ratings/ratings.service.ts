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
    return await this.prisma.rating.create({
      data: {
        content,
        courseId,
        quality,
        userId
      }
    })
  }

  async findAll(current: string, pageSize: string, user: IUser) {
    return `This action returns all ratings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rating`;
  }

  update(id: number, updateRatingDto: UpdateRatingDto) {
    return `This action updates a #${id} rating`;
  }

  remove(id: number) {
    return `This action removes a #${id} rating`;
  }
}
