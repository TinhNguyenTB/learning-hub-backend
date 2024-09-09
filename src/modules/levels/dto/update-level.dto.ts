import { PartialType } from '@nestjs/mapped-types';
import { CreateLevelDto } from './create-level.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLevelDto extends PartialType(CreateLevelDto) {
    @IsNotEmpty()
    @IsString()
    id: string
}
