import { IsNotEmpty, IsString } from "class-validator";

export class CreateSubcategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    categoryId: string
}
