import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
    @IsNotEmpty()
    @IsString()
    id: string
}
