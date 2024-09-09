import { IsNotEmpty, IsString } from "class-validator";

export class CreateProgressDto {
    @IsString()
    @IsNotEmpty()
    studentId: string

    @IsNotEmpty()
    @IsString()
    sectionId: string
}
