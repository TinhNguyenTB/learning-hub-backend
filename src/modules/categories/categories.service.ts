import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name }
    })
    if (category) {
      throw new BadRequestException(`Category ${createCategoryDto.name} already exist`)
    }
    return await this.prisma.category.create({
      data: { name: createCategoryDto.name }
    })
  }

  async findAll() {
    return await this.prisma.category.findMany({
      where: { deleted: false },
      orderBy: {
        name: 'asc'
      },
      include: {
        subCategories: {
          orderBy: {
            name: 'asc'
          },
        }
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (!id) {
      throw new BadRequestException(`Missing required parameter`)
    }
    // check category exist by id
    const isExist = await this.prisma.category.findUnique({
      where: {
        id,
        deleted: false
      }
    })
    if (!isExist) {
      throw new BadRequestException(`Category not found`)
    }
    // check category exist by name
    const category = await this.prisma.category.findUnique({
      where: {
        name: updateCategoryDto.name,
        deleted: false
      }
    })
    if (category) {
      throw new BadRequestException(`Category ${updateCategoryDto.name} already exist`);
    }
    return await this.prisma.category.update({
      where: { id },
      data: { name: updateCategoryDto.name }
    })
  }

  async remove(id: string) {
    let category = await this.prisma.category.findUnique({
      where: {
        id,
        deleted: false
      }
    })
    if (!category) {
      throw new BadRequestException(`Category not found`)
    }
    category = await this.prisma.category.update({
      where: { id },
      data: { deleted: true }
    })
    return {
      deleted: category.deleted
    }
  }
}
