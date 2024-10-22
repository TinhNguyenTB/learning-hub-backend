import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    confirmPassword: string;
}

export class ActiveDto {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    code: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    oldPassword: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    confirmPassword: string;
}

export class SocialMediaAccountDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    image: string
}