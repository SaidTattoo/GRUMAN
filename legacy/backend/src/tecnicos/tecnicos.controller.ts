import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { User } from './tecnico.entity';
import { TecnicosService } from './tecnicos.service';

@Controller('tecnicos')
export class TecnicosController {
  constructor(private readonly tecnicosService: TecnicosService) {}
  @Get()
  async findAll(): Promise<User[]> {
    return this.tecnicosService.findAll();
  }
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.tecnicosService.delete(id);
  }
  @Post()
  async create(@Body() tecnico: User): Promise<User> {
    return this.tecnicosService.create(tecnico);
  }
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() tecnico: User,
  ): Promise<User> {
    return this.tecnicosService.update(id, tecnico);
  }
  
}
