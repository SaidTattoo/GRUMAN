import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Vehiculo } from './vehiculos.entity';
import { VehiculosService } from './vehiculos.service';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  findAll(): Promise<Vehiculo[]> {
    return this.vehiculosService.findAll();
  }

   @Get(':id')
  findOne(@Param('id') id: number): Promise<Vehiculo> {
    return this.vehiculosService.findOne(id);
  }

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
    return this.vehiculosService.delete(id);
  }

  @Put(':id/user/:user_id')
  updateUser(@Param('id') id: number, @Param('user_id') user_id: number): Promise<Vehiculo> {
    console.log(id, user_id);
    return this.vehiculosService.updateUser(id, user_id);
  }

  @Put(':id/remove-user')
  async removeUser(@Param('id') id: number): Promise<void> {
    return this.vehiculosService.removeUser(id);
  }
}
