import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    content: string

    @IsNotEmpty()
    @IsString()
    courseId: string

    @IsNotEmpty()
    @IsString()
    userId: string

    @IsOptional()
    @IsString()
    parentId: string
}
