import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto) {
    const { content, courseId, userId } = createCommentDto;

    return await this.prisma.comment.create({
      data: { content, courseId, userId },
    });
  }

  async findAll(current: number, pageSize: number, courseId: string) {
    if (!current || current < 1) current = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;

    const skip = current > 1 ? (current - 1) * pageSize : 0;

    const total = await this.prisma.comment.count({
      where: { courseId, deleted: false },
    });

    const result = await this.prisma.comment.findMany({
      take: pageSize,
      skip: skip,
      where: { courseId, deleted: false },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const totalPages = Math.ceil(total / pageSize);
    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: total,
      },
      result,
    };
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id, deleted: false },
    });
    if (!comment) {
      throw new BadGatewayException('Comment not found');
    }

    return await this.prisma.comment.update({
      where: { id },
      data: { content: updateCommentDto.content },
    });
  }

  async remove(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id, deleted: false },
    });
    if (!comment) {
      throw new BadGatewayException('Comment not found');
    }

    return await this.prisma.comment.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
