import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubItemDto {
    @IsNotEmpty()
    @IsString()
    name: string;
} 