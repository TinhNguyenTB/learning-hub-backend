import { PartialType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './create-section.dto';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSectionDto extends PartialType(CreateSectionDto) {
    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @IsString()
    videoUrl: string

    @IsOptional()
    @IsBoolean()
    isPublished: boolean

    @IsOptional()
    @IsBoolean()
    isFree: boolean
}

export class ReorderSectionDto {
    @IsArray()
    @ValidateNested()
    @Type(() => List)
    list: List[]

    @IsNotEmpty()
    courseId: string
}

class List {
    @IsNotEmpty()
    @IsString()
    id: string

    @IsNotEmpty()
    @IsNumber()
    position: number
}
