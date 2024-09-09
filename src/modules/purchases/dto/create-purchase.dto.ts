import { IsNotEmpty, IsString } from "class-validator"

export class CreatePurchaseDto {
    @IsNotEmpty()
    @IsString()
    customerId: string

    @IsNotEmpty()
    @IsString()
    courseId: string
}
