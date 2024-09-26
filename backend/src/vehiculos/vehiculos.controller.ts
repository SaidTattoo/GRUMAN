import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Vehiculo } from './vehiculos.entity';
import { VehiculosService } from './vehiculos.service';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  findAll(): Promise<Vehiculo[]> {
    return this.vehiculosService.findAll();
  }

  /* @Get(':id')
  findOne(@Param('id') id: number): Promise<Vehiculo> {
    return this.vehiculosService.findOne(id);
  }
 */
  @Post()
  create(@Body() vehiculo: Vehiculo): Promise<Vehiculo> {
    return this.vehiculosService.create(vehiculo);
  }

  /*  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() vehiculo: Vehiculo,
  ): Promise<Vehiculo> {
    return this.vehiculosService.update(id, vehiculo);
  } */

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.vehiculosService.remove(id);
  }
}
