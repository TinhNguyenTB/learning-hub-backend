import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class SubcategoriesService {
  constructor(private prisma: PrismaService) { }

  create(createSubcategoryDto: CreateSubcategoryDto) {
    return 'This action adds a new subcategory';
  }

  async findAll(current: number, pageSize: number, search: string) {
    if (!current || current < 1) current = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;
    if (!search) search = "";

    const skip = current > 1 ? (current - 1) * pageSize : 0;

    const total = await this.prisma.subCategory.count({
      where: {
        OR: [
          { name: { contains: search } },
        ],
      },
    });

    const result = await this.prisma.subCategory.findMany({
      take: pageSize,
      skip: skip,
      where: {
        OR: [
          { name: { contains: search } },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const totalPages = Math.ceil(total / pageSize);

    return {
      meta: {
        current: current, //trang hiện tại
        pageSize: pageSize, //số lượng bản ghi trong 1 trang
        pages: totalPages, //tổng số trang với điều kiện query
        total: total // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} subcategory`;
  }

  update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    return `This action updates a #${id} subcategory`;
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException
    }
    const subcategory = await this.prisma.subCategory.findUnique({
      where: { id }
    })
    if (!subcategory) {
      throw new BadRequestException("Not found subcategory")
    }
    return await this.prisma.subCategory.delete({
      where: { id }
    })
  }
}
