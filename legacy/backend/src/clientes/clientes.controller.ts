import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Cliente } from './clientes.entity';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  async findAll(): Promise<Cliente[]> {
    //traer todo lo que activo este en true
    return this.clientesService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Cliente | null> {
    return this.clientesService.findOne(id);
  }

  @Post()
  async create(@Body() cliente: Cliente): Promise<Cliente> {
    //console.log(cliente);
    return this.clientesService.create(cliente);
  }
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() cliente: Cliente,
  ): Promise<Cliente | null> {
    return this.clientesService.update(id, cliente);
  }
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.clientesService.delete(id);
  }
}
