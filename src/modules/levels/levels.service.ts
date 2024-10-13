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
        name: createLevelDto.name,
        deleted: false
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
        id,
        deleted: false
      }
    })
  }

  async update(id: string, updateLevelDto: UpdateLevelDto) {
    // check level exist by id
    const isExist = await this.prisma.level.findUnique({
      where: {
        id,
        deleted: false
      }
    })
    if (!isExist) {
      throw new BadRequestException(`Level not found`)
    }
    // check level exist by name
    const level = await this.prisma.level.findUnique({
      where: {
        name: updateLevelDto.name,
        deleted: false
      }
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
    if (!id) {
      throw new BadRequestException(`Missing required parameter`)
    }
    let level = await this.prisma.level.findUnique({
      where: {
        id,
        deleted: false
      }
    })
    if (!level) {
      throw new BadRequestException(`Level not found`)
    }
    level = await this.prisma.level.update({
      where: {
        id,
        deleted: false
      },
      data: { deleted: true }
    })
    return {
      deleted: level.deleted
    }
  }
}
