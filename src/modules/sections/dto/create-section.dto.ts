import { IsInt, IsNotEmpty, IsString } from "class-validator"

export class CreateSectionDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    courseId: string
}
