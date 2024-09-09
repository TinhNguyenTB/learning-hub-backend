import { IsNotEmpty, IsString } from "class-validator";

export class CreateVideoDto {
    @IsNotEmpty()
    @IsString()
    url: string

    @IsNotEmpty()
    @IsString()
    sectionId: string
}
