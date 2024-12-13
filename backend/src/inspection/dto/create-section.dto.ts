import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateSectionDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsBoolean()
    disabled?: boolean;
} 