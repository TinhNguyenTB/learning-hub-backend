import { PartialType } from '@nestjs/mapped-types';
import { CreateProgressDto } from './create-progress.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProgressDto extends PartialType(CreateProgressDto) {
    @IsNotEmpty()
    @IsString()
    id: string

    @IsOptional()
    @IsBoolean()
    isCompleted: boolean
}
