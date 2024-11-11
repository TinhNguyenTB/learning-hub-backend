import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage } from '@/decorator/customize';
import { Roles } from '@/decorator/roles.decorator';
import { Role } from '@/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Roles(Role.Admin)
  @ResponseMessage("Create a new user")
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.Admin)
  @Get()
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('search') search: string,
  ) {
    return this.usersService.findAll(+current, +pageSize, search);
  }

  @Roles(Role.Admin)
  @ResponseMessage("Get user by id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Roles(Role.Admin)
  @ResponseMessage("Delete user by id")
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Body("deleted") deleted: boolean
  ) {
    return this.usersService.remove(id, deleted);
  }
}
