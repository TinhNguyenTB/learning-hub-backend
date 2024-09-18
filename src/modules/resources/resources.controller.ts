import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResponseMessage, User } from '@/decorator/customize';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) { }

  @ResponseMessage("Create a new resource")
  @Post()
  create(@Body() createResourceDto: CreateResourceDto, @User() user: IUser) {
    return this.resourcesService.create(createResourceDto, user);
  }

  @Get()
  findAll() {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    return this.resourcesService.update(+id, updateResourceDto);
  }

  @ResponseMessage("Delete resource by id")
  @Delete(':id')
  remove(@Param('id') id: string, @Body("sectionId") sectionId: string) {
    return this.resourcesService.remove(id, sectionId);
  }
}
