import { Controller, Get } from '@nestjs/common';
import { Repuesto } from './repuestos.entity';
import { RepuestosService } from './repuestos.service';

@Controller('repuestos')
export class RepuestosController {
  constructor(private readonly repuestosService: RepuestosService) {}

  @Get()
  async findAll(): Promise<Repuesto[]> {
    return this.repuestosService.findAll();
  }
}
