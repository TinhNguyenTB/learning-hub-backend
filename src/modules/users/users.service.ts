import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { PrismaService } from '@/prisma.service';
import { comparePassword, generateHashPassword, generateOTP } from '@/helpers/utils';
import { ActiveDto, ChangePasswordDto, RegisterDto, SocialMediaAccountDto } from '@/auth/dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
    private configService: ConfigService
  ) { }

  async isEmailExist(email: string) {
    const user = await this.prisma.user.findFirst({
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
      throw new BadRequestException(`Email '${email}' already in use. Please try another email.`)
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

  async handleLoginSocialMedia(data: SocialMediaAccountDto) {
    const { email, name, accountType, image } = data;
    let user = await this.prisma.user.findFirst({
      where: {
        email,
        accountType
      }
    })
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          accountType,
          isActive: true,
          image: image ?? null
        }
      })
    }
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      },
      select: {
        name: true,
        id: true,
        email: true,
        image: true,
        role: true,
        accountType: true,
        isActive: true
      }
    })
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: {
        email
      }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })
    if (!user) {
      throw new BadRequestException("User not found")
    }
    return await this.prisma.user.delete({
      where: { id },
    })
  }

  sendEmailActivate(user: User, codeId: string, codeExpired: number) {
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate your account ✔',
      template: 'register',
      context: {
        name: user.name ?? user.email,
        activationCode: codeId,
        codeExpired: codeExpired
      }
    });
  }

  sendEmailForgotPassword(user: User, randomPass: string) {
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Forgot password',
      template: 'forgot-password',
      context: {
        name: user.name ?? user.email,
        newPassword: randomPass,
      }
    });
  }

  async handleRegister(registerDto: RegisterDto) {
    const { name, email, password, confirmPassword } = registerDto;
    // check email
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email '${email}' already in use. Please try another email.`)
    }
    if (password !== confirmPassword) {
      throw new BadRequestException(`Passwords don't match`)
    }
    // hash password
    const hashPassword = await generateHashPassword(password);
    const codeId = generateOTP()
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
    this.sendEmailActivate(user, codeId, codeExpired)
    return {
      id: user.id,
      email: user.email
    };
  }

  async handleActivate(activeDto: ActiveDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: activeDto.id,
        codeId: activeDto.code
      }
    })
    if (!user) {
      throw new BadRequestException("Your activation code is invalid")
    }
    // check activation code expired
    const isBeforeCheck = dayjs().isBefore(user.codeExpired);
    if (isBeforeCheck) {
      await this.prisma.user.update({
        where: {
          id: activeDto.id
        },
        data: {
          isActive: true
        }
      });
    }
    else {
      throw new BadRequestException("Your activation code is invalid or has expired")
    }
    return {
      isActive: isBeforeCheck
    }
  }

  async handleRetryActivate(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email }
    });
    if (!user) {
      throw new BadRequestException("Account is not exist")
    }
    else if (user.isActive) {
      throw new BadRequestException("Account has been activated")
    }
    // update codeId and codeExpired
    const codeId = generateOTP()
    const codeExpired = this.configService.get<number>("ACTIVE_CODE_EXPIRED")
    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        codeId: codeId,
        codeExpired: dayjs().add(codeExpired, 'minutes').toDate()
      }
    })
    //send email
    this.sendEmailActivate(user, codeId, codeExpired)
    return {
      id: user.id
    }
  }

  async handleForgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException("Email is required")
    }
    const user = await this.prisma.user.findFirst({
      where: { email }
    });
    if (!user) {
      throw new BadRequestException("Account is not exist")
    }
    // update codeId and codeExpired
    const randomPass = uuidv4().slice(0, 8); // get first 8 chars
    const newPassword = await generateHashPassword(randomPass);
    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: newPassword
      }
    })
    //send email
    this.sendEmailForgotPassword(user, randomPass)
    return;
  }

  async handleChangePassword(changePasswordDto: ChangePasswordDto, user: IUser) {
    const findUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        email: user.email
      }
    });
    if (!findUser) {
      throw new BadRequestException("Account is not exist")
    }
    const isValidPassword = await comparePassword(changePasswordDto.oldPassword, findUser.password);
    if (!isValidPassword) {
      throw new BadRequestException("Old password is incorrect")
    }
    if (changePasswordDto.password !== changePasswordDto.confirmPassword) {
      throw new BadRequestException("Passwords do not match")
    }
    const newPassword = await generateHashPassword(changePasswordDto.password);
    const result = await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: newPassword
      }
    })
    return {
      id: result.id,
      updatedAt: result.updatedAt
    }
  }
}
