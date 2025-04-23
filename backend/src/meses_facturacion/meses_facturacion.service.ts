import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MesesFacturacion } from './meses_facturacion.entity';

@Injectable()
export class MesesFacturacionService {
  constructor(
    @InjectRepository(MesesFacturacion)
    private readonly mesesFacturacionRepository: Repository<MesesFacturacion>,
  ) {}

  /**
   * Obtiene todos los meses de facturación
   * @param soloActivos Si es true, retorna solo los meses activos
   * @returns Lista de meses de facturación
   */
  async findAll(soloActivos: boolean = false): Promise<MesesFacturacion[]> {
    const query = this.mesesFacturacionRepository.createQueryBuilder('meses_facturacion');
    
    if (soloActivos) {
      query.where('meses_facturacion.estado = :estado', { estado: true });
    }
    
    return await query.orderBy('meses_facturacion.id', 'DESC').getMany();
  }

  /**
   * Obtiene un mes de facturación por su ID
   * @param id ID del mes de facturación
   * @returns Mes de facturación
   */
  async findOne(id: number): Promise<MesesFacturacion> {
    return await this.mesesFacturacionRepository.findOne({
      where: { id }
    });
  }

  /**
   * Crea un nuevo mes de facturación
   * @param mes Nombre del mes (ej: "Mayo 2025")
   * @param estado Estado inicial del mes (activo/inactivo)
   * @returns Mes de facturación creado
   */
  async create(mes: string, estado: boolean = true): Promise<MesesFacturacion> {
    const mesFacturacion = this.mesesFacturacionRepository.create({ 
      mes, 
      estado 
    });
    return await this.mesesFacturacionRepository.save(mesFacturacion);
  }

  /**
   * Actualiza un mes de facturación
   * @param id ID del mes de facturación
   * @param mes Nuevo nombre del mes (opcional)
   * @param estado Nuevo estado del mes (opcional)
   * @returns Mes de facturación actualizado
   */
  async update(id: number, mes?: string, estado?: boolean): Promise<MesesFacturacion> {
    const updateData: any = {};
    
    if (mes !== undefined) {
      updateData.mes = mes;
    }
    
    if (estado !== undefined) {
      updateData.estado = estado;
    }
    
    await this.mesesFacturacionRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Cambia el estado de un mes de facturación
   * @param id ID del mes de facturación
   * @param estado Nuevo estado (true: activo, false: inactivo)
   * @returns Mes de facturación actualizado
   */
  async cambiarEstado(id: number, estado: boolean): Promise<MesesFacturacion> {
    await this.mesesFacturacionRepository.update(id, { estado });
    return this.findOne(id);
  }

  /**
   * Elimina un mes de facturación
   * @param id ID del mes de facturación
   */
  async remove(id: number): Promise<void> {
    await this.mesesFacturacionRepository.delete(id);
  }

  /**
   * Inicializa los meses de facturación para 2025 y 2026
   * @returns Lista de meses creados
   */
  
}
