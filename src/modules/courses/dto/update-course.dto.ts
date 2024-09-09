import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
    @IsNotEmpty()
    @IsString()
    id: string

    @IsOptional()
    subTitle: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @IsString()
    imageUrl: string

    @IsNumber()
    price: number

    @IsOptional()
    @IsBoolean()
    isPublished: boolean

    @IsNotEmpty()
    @IsString()
    levelId: string
}
