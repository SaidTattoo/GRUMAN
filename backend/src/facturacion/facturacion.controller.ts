import { Body, Controller, Get, Param, Post, Inject, forwardRef, Put, BadRequestException } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { ClientService } from '../client/client.service';

@Controller('facturacion')
export class FacturacionController {
    constructor(
        private readonly facturacionService: FacturacionService,
        @Inject(forwardRef(() => ClientService))
        private readonly clientesService: ClientService,
    ) {}

  @Post(':id_cliente')
  async crearFacturacion(
    @Param('id_cliente') id_cliente: number,
    @Body() body: { mes: string; fecha_inicio: Date; fecha_termino: Date; hh: number },
  ) {
    const cliente = await this.clientesService.findOneClient(id_cliente);
    return this.facturacionService.crearFacturacion(
      cliente,
      body.mes,
      new Date(body.fecha_inicio),
      new Date(body.fecha_termino),
      body.hh,
    );
  }

  @Get(':id_cliente')
  async listarFacturacionPorCliente(@Param('id_cliente') id_cliente: number) {
    return this.facturacionService.listarFacturacionPorCliente(id_cliente);
  }

  @Put(':id')
  async actualizarMesDeFacturacion(
    @Param('id') id: number, 
    @Body() body: { fecha_inicio: string; fecha_termino: string }
  ) {
    try {
      if (!body.fecha_inicio || !body.fecha_termino) {
        throw new BadRequestException('Las fechas son requeridas');
      }

      const fecha_inicio = new Date(body.fecha_inicio);
      const fecha_termino = new Date(body.fecha_termino);

      if (isNaN(fecha_inicio.getTime()) || isNaN(fecha_termino.getTime())) {
        throw new BadRequestException('Fechas inválidas');
      }

      return this.facturacionService.actualizarMesDeFacturacion(
        id,
        fecha_inicio,
        fecha_termino
      );
    } catch (error) {
      throw new BadRequestException(`Error al procesar las fechas: ${error.message}`);
    }
  }

  @Get('generar-facturacion/:id_cliente/:anio_inicio/:anios')
  async generarFacturacionMensual(
    @Param('id_cliente') id_cliente: number,
    @Param('anio_inicio') anio_inicio: number,
    @Param('anios') anios: number
  ) {
    console.log('--------1', id_cliente, anio_inicio, anios);
    return this.facturacionService.generarFacturacionMensualAutomatica(id_cliente, anio_inicio, anios);
  }
}
