import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) { }

  create(createPurchaseDto: CreatePurchaseDto) {
    return 'This action adds a new purchase';
  }

  async findAll(instructorId: string) {
    if (!instructorId) {
      throw new BadRequestException("Missing query param")
    }
    const purchases = await this.prisma.purchase.findMany({
      where: {
        course: { instructorId: instructorId },
      },
      include: {
        course: true
      }
    })
    return purchases
  }

  async findAllForStudent(user: IUser) {
    return await this.prisma.purchase.findMany({
      where: {
        customerId: user.id,
      },
      select: {
        course: {
          include: {
            category: true,
            subCategory: true,
            sections: {
              where: {
                isPublished: true
              }
            },
            level: {
              select: {
                name: true
              }
            },
            instructor: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    })
  }

  async findOne(courseId: string, user: IUser) {
    return await this.prisma.purchase.findUnique({
      where: {
        customerId_courseId: {
          customerId: user.id,
          courseId
        }
      }
    })
  }

  update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    return `This action updates a #${id} purchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }
}
