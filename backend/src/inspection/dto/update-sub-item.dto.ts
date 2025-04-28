import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSubItemDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsBoolean()
    foto_obligatoria?: boolean;
} 