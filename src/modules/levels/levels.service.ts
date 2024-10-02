import { Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class LevelsService {
  constructor(
    private prisma: PrismaService
  ) { }
  create(createLevelDto: CreateLevelDto) {
    return 'This action adds a new level';
  }

  async findAll() {
    return await this.prisma.level.findMany({});
  }

  async findOne(id: string) {
    return await this.prisma.level.findUnique({
      where: {
        id
      }
    })
  }

  update(id: number, updateLevelDto: UpdateLevelDto) {
    return `This action updates a #${id} level`;
  }

  remove(id: number) {
    return `This action removes a #${id} level`;
  }
}
