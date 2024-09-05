import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { PrismaService } from '@/prisma.service';
import { generateHashPassword } from '@/helpers/utils';
import { RegisterDto } from '@/auth/dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
    private configService: ConfigService
  ) { }

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

  async handleRegister(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    // check email
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email '${email}' already exist. Please try another email.`)
    }
    // hash password
    const hashPassword = await generateHashPassword(password);
    const codeId = uuidv4();
    const codeExpired = this.configService.get<number>("ACTIVE_CODE_EXPIRED")
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        isActive: false,
        codeId: codeId,
        codeExpired: dayjs().add(codeExpired, 'minutes').toDate()
      }

    })
    //send email
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate your account ✔',
      template: 'register',
      context: {
        name: user.name ?? user.email,
        activationCode: codeId
      }
    })

    return {
      id: user.id
    };
  }
}
