import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Repuesto } from './repuestos.entity';
import { RepuestosService } from './repuestos.service';

@Controller('repuestos')
export class RepuestosController {
  constructor(private readonly repuestosService: RepuestosService) {}

  @Get()
  async findAll(): Promise<Repuesto[]> {
    return this.repuestosService.findAll();
  }
  @Post()
  async create(@Body() repuesto: Repuesto): Promise<Repuesto> {
    return this.repuestosService.create(repuesto);
  }
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.repuestosService.delete(id);
  }
  @Put(':id')
  async update(@Param('id') id: number, @Body() repuesto: Repuesto): Promise<Repuesto> {
    return this.repuestosService.update(id, repuesto);
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Repuesto> {
    return this.repuestosService.findOne(id);
  }
}
