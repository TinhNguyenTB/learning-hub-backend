import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseDto } from './create-purchase.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto) {
    @IsNotEmpty()
    @IsString()
    id: string
}
