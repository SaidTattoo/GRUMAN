import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, Query, ParseBoolPipe, DefaultValuePipe } from '@nestjs/common';
import { MesesFacturacionService } from './meses_facturacion.service';
import { MesesFacturacion } from './meses_facturacion.entity';

@Controller('meses-facturacion')
export class MesesFacturacionController {
  constructor(private readonly mesesFacturacionService: MesesFacturacionService) {}

  /**
   * Obtiene todos los meses de facturación
   * @param soloActivos Filtro para obtener solo meses activos
   * @returns Lista de meses de facturación
   */
  @Get()
  async findAll(
    @Query('soloActivos', new DefaultValuePipe(false), ParseBoolPipe) soloActivos: boolean
  ): Promise<MesesFacturacion[]> {
    return this.mesesFacturacionService.findAll(soloActivos);
  }

  /**
   * Obtiene un mes de facturación por su ID
   * @param id ID del mes
   * @returns Mes de facturación
   */
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<MesesFacturacion> {
    return this.mesesFacturacionService.findOne(id);
  }

  /**
   * Crea un nuevo mes de facturación
   * @param mes Nombre del mes
   * @param estado Estado inicial (activo/inactivo)
   * @returns Mes de facturación creado
   */
  @Post()
  async create(
    @Body('mes') mes: string,
    @Body('estado', new DefaultValuePipe(true), ParseBoolPipe) estado: boolean
  ): Promise<MesesFacturacion> {
    return this.mesesFacturacionService.create(mes, estado);
  }

  /**
   * Actualiza un mes de facturación
   * @param id ID del mes
   * @param mes Nuevo nombre del mes (opcional)
   * @param estado Nuevo estado (opcional)
   * @returns Mes de facturación actualizado
   */
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body('mes') mes?: string,
    @Body('estado') estado?: boolean
  ): Promise<MesesFacturacion> {
    return this.mesesFacturacionService.update(id, mes, estado);
  }

  /**
   * Cambia el estado de un mes de facturación (activar/desactivar)
   * @param id ID del mes
   * @param estado Nuevo estado
   * @returns Mes de facturación actualizado
   */
  @Put(':id/cambiar-estado')
  async cambiarEstado(
    @Param('id') id: number,
    @Body('estado', ParseBoolPipe) estado: boolean
  ): Promise<MesesFacturacion> {
    return this.mesesFacturacionService.cambiarEstado(id, estado);
  }

  /**
   * Elimina un mes de facturación
   * @param id ID del mes
   */
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number): Promise<void> {
    return this.mesesFacturacionService.remove(id);
  }

  /**
   * Inicializa los meses de facturación para 2025 y 2026
   * @returns Lista de meses creados
   */


  /**
   * Endpoint específico para obtener meses únicos
   */
  @Get('obtener-meses-unicos')
  async obtenerMesesUnicos(){
    console.log('Endpoint obtener-meses-unicos invocado con GET');
    const meses = await this.mesesFacturacionService.findAll(true);
    console.log('Meses encontrados:', meses);
    return meses;
  }
}
