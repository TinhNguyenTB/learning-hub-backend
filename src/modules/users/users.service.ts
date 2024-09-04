import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { PrismaService } from '@/prisma.service';
import { generateHashPassword } from '@/helpers/utils';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async isEmailExist(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email
      }
    })
    if (user) {
      return true;
    }
    return false;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    // check email
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email '${email}' already exist. Please try another email.`)
    }
    // hash password
    const hashPassword = await generateHashPassword(password)
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
      }
    })
    return {
      id: user.id
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email
      }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
