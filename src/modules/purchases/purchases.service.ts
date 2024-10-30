import { Injectable } from '@nestjs/common';
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
