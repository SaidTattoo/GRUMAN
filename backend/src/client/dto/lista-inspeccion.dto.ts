import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';

class RepuestoDto {
  @IsString()
  nombre: string;
}

class SubItemDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  comentarios?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RepuestoDto)
  repuestos?: RepuestoDto[];
}

class ItemDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubItemDto)
  subItems: SubItemDto[];
}

export class ListaInspeccionDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}

export class UpdateListaInspeccionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListaInspeccionDto)
  listaInspeccion: ListaInspeccionDto[];
} 