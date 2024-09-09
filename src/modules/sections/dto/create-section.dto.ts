import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateSectionDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsNumber()
    position: number

    @IsNotEmpty()
    @IsString()
    courseId: string
}
