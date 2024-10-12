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
    const isExist = await this.prisma.category.findUnique({
      where: { id }
    })
    if (!isExist) {
      throw new BadRequestException(`Not found category`)
    }
    const category = await this.prisma.category.findUnique({
      where: { name: updateCategoryDto.name }
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
    const isExist = await this.prisma.category.findUnique({
      where: { id }
    })
    if (!isExist) {
      throw new BadRequestException(`Not found category`)
    }
    return await this.prisma.category.delete({
      where: { id }
    })
  }
}
