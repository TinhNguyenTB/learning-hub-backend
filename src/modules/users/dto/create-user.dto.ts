import { IsEmail, IsNotEmpty, IsOptional } from "class-validator"

export class CreateUserDto {
    @IsEmail()
    email: string

    @IsNotEmpty()
    password: string

    @IsNotEmpty()
    name: string

    @IsOptional()
    image: string
}
