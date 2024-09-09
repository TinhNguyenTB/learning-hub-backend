import { IsNotEmpty, IsString } from "class-validator"

export class CreateResourceDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    fileUrl: string

    @IsNotEmpty()
    @IsString()
    sectionId: string
}
