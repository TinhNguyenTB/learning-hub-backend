import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(
    private prisma: PrismaService
  ) { }

  async create(createResourceDto: CreateResourceDto, user: IUser) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: createResourceDto.courseId,
        instructorId: user.id
      }
    })
    if (!course) {
      return new NotFoundException("Course not found")
    }

    const section = await this.prisma.section.findUnique({
      where: {
        id: createResourceDto.sectionId,
        courseId: createResourceDto.courseId
      }
    })
    if (!section) {
      return new NotFoundException("Section not found")
    }

    const { name, fileUrl } = createResourceDto
    const resource = await this.prisma.resource.create({
      data: {
        name,
        fileUrl,
        sectionId: createResourceDto.sectionId
      }
    })

    return resource;
  }

  findAll() {
    return `This action returns all resources`;
  }

  findOne(id: number) {
    return `This action returns a #${id} resource`;
  }

  update(id: number, updateResourceDto: UpdateResourceDto) {
    return `This action updates a #${id} resource`;
  }

  async remove(id: string, sectionId: string) {
    return await this.prisma.resource.delete({
      where: {
        id,
        sectionId: sectionId
      }
    })
  }
}
