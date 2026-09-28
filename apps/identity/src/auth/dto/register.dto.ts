import { IsEmail, Matches, MinLength, IsString } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(3)
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username must contain only letters, numbers and underscores' })
    username!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}