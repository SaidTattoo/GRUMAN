import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsOptional()
    @IsBoolean()
    disabled?: boolean;
} 