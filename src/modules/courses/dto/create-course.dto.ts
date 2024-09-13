import { IsNotEmpty, IsString } from "class-validator";

export class CreateCourseDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    categoryId: string

    @IsNotEmpty()
    @IsString()
    subCategoryId: string

}
