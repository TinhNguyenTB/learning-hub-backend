import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(
    private prisma: PrismaService
  ) { }

  async create(createResourceDto: CreateResourceDto, user: IUser) {
    // check course exist
    const course = await this.prisma.course.findUnique({
      where: {
        id: createResourceDto.courseId,
        deleted: false,
        instructorId: user.id
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    // check section exist
    const section = await this.prisma.section.findUnique({
      where: {
        id: createResourceDto.sectionId,
        deleted: false,
        courseId: createResourceDto.courseId
      }
    })
    if (!section) {
      throw new NotFoundException("Section not found")
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
    if (!id || !sectionId) {
      throw new BadRequestException("Missing required parameters")
    }
    let resource = await this.prisma.resource.findUnique({
      where: {
        id,
        deleted: false
      }
    })
    if (!resource) {
      throw new BadRequestException("Resource not found")
    }
    resource = await this.prisma.resource.update({
      where: {
        id,
        sectionId: sectionId,
        deleted: false
      },
      data: { deleted: true }
    })
    return {
      deleted: resource.deleted
    }
  }
}
