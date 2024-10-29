import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpSertProgressDto {
    @IsString()
    @IsNotEmpty()
    studentId: string

    @IsNotEmpty()
    @IsString()
    sectionId: string

    @IsBoolean()
    isCompleted: boolean
}

export class CompletedProgressDto {
    @IsNotEmpty()
    @IsString()
    studentId: string

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    publishedSectionsId: string[]
}
