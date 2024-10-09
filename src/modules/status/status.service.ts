import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) { }

  async create(createStatusDto: CreateStatusDto) {
    const { name } = createStatusDto;
    const isExist = await this.prisma.status.findFirst({
      where: {
        name
      }
    })
    if (isExist) {
      throw new BadRequestException(`${name} status  already exist`)
    }

    return await this.prisma.status.create({
      data: {
        name
      }
    });
  }

  async findAll() {
    return await this.prisma.status.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} status`;
  }

  update(id: number, updateStatusDto: UpdateStatusDto) {
    return `This action updates a #${id} status`;
  }

  remove(id: number) {
    return `This action removes a #${id} status`;
  }
}
