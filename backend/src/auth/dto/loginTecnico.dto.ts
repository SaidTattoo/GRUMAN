import { IsString, IsNotEmpty } from 'class-validator';

export class LoginTecnicoDto {
    @IsString()
    @IsNotEmpty()
    rut: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}