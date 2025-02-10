import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './vehiculos.entity';
import { Documentos } from '../documentos/documentos.entity';
import { join } from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private vehiculosRepository: Repository<Vehiculo>,
    @InjectRepository(Documentos)
    private documentosRepository: Repository<Documentos>
  ) {}

  findAll(): Promise<Vehiculo[]> {
    /* order by id desc */
    return this.vehiculosRepository.find({ order: { id: 'DESC' }, where: { deleted: false } });
  }

  async findOne(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculosRepository.findOne({ where: { id } });
    if (vehiculo) {
      vehiculo.deserializeDocumentacion();
    }
    return vehiculo;
  } 

  create(vehiculo: Vehiculo): Promise<Vehiculo> {
    return this.vehiculosRepository.save(vehiculo);
  }

  /*   async update(id: number, vehiculo: Vehiculo): Promise<Vehiculo> {
    await this.vehiculosRepository.update(id, vehiculo);
    return this.findOne(id);
  } */

 


  async updateUser(id: number, user_id: number): Promise<Vehiculo> {
    await this.vehiculosRepository.update(id, { user_id });
    return this.findOne(id);
  }

  async removeUser(id: number): Promise<void> {
    await this.vehiculosRepository.update(id, { user_id: null });
  }

  async delete(id: number): Promise<void> {
    await this.vehiculosRepository.update(id, { deleted: true });
  }

  async getDocumentacionVehiculo(vehiculoId: string): Promise<any> {
    const documentacion = {
      revision_tecnica: null,
      permiso_circulacion: null,
      seguro_obligatorio: null,
      gases: null,
      otros: []
    };

    try {
      const basePath = join(process.cwd(), 'uploads', 'vehiculos', vehiculoId, 'documentos');
      await fs.access(basePath);

      // Buscar documentos en la base de datos
      const documentos = await this.documentosRepository.find({
        where: { vehiculoId: parseInt(vehiculoId) }
      });

      // Procesar cada tipo de documento
      for (const tipo of ['revision_tecnica', 'permiso_circulacion', 'seguro_obligatorio', 'gases']) {
        const doc = documentos.find(d => d.tipo === tipo);
        if (doc) {
          documentacion[tipo] = {
            id: doc.id,
            fecha: doc.fecha,
            fechaVencimiento: doc.fechaVencimiento
          };
        }
      }

      // Procesar otros documentos
      const otrosDocumentos = documentos.filter(d => d.tipo === 'otros');
      documentacion.otros = otrosDocumentos.map(doc => ({
        id: doc.id,
        nombre: doc.nombre,
        fecha: doc.fecha,
        fechaVencimiento: doc.fechaVencimiento
      }));

      return documentacion;
    } catch (error) {
      console.error('Error al obtener documentación:', error);
      return documentacion;
    }
  }
}
