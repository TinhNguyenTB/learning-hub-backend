import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class LevelsService {
  constructor(
    private prisma: PrismaService
  ) { }

  async create(createLevelDto: CreateLevelDto) {
    const isExist = await this.prisma.level.findFirst({
      where: {
        name: createLevelDto.name
      }
    })
    if (isExist) {
      throw new BadRequestException(`Level ${createLevelDto.name} already exist`)
    }
    return await this.prisma.level.create({
      data: {
        name: createLevelDto.name
      }
    })
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

  async update(id: string, updateLevelDto: UpdateLevelDto) {
    const isExist = await this.prisma.level.findUnique({
      where: {
        id
      }
    })
    if (!isExist) {
      throw new BadRequestException(`Not found level`)
    }
    const level = await this.prisma.level.findUnique({
      where: { name: updateLevelDto.name }
    })
    if (level) {
      throw new BadRequestException(`Level ${updateLevelDto.name} already exist`);
    }
    return this.prisma.level.update({
      where: { id },
      data: { name: updateLevelDto.name }
    })
  }

  async remove(id: string) {
    const isExist = await this.prisma.level.findUnique({
      where: {
        id
      }
    })
    if (!isExist) {
      throw new BadRequestException(`Not found level`)
    }
    return await this.prisma.level.delete({
      where: {
        id
      }
    })
  }
}
