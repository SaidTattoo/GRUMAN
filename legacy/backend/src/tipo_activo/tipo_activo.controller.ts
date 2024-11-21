import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TipoActivo } from './tipo_activo.entity';
import { TipoActivoService } from './tipo_activo.service';

@Controller('tipo-activo')
export class TipoActivoController {
  constructor(private readonly tipoActivoService: TipoActivoService) {}

  @Get()
  async findAll(): Promise<TipoActivo[]> {
    return this.tipoActivoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<TipoActivo | null> {
    return this.tipoActivoService.findOne(id);
  }

  @Post()
  async create(@Body() tipoActivo: TipoActivo): Promise<TipoActivo> {
    return this.tipoActivoService.create(tipoActivo);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() tipoActivo: TipoActivo,
  ): Promise<TipoActivo | null> {
    return this.tipoActivoService.update(id, tipoActivo);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.tipoActivoService.delete(id);
  }
}
