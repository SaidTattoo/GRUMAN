import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repuesto } from './repuestos.entity';
import { ClienteRepuestoService } from '../cliente-repuesto/cliente-repuesto.service';
import { ClienteRepuesto } from 'src/cliente-repuesto/cliente-repuesto.entity';
import { Client } from 'src/client/client.entity';

@Injectable()
export class RepuestosService {
  constructor(
    @InjectRepository(Repuesto)
    private readonly repuestosRepository: Repository<Repuesto>,
    private readonly clienteRepuestoService: ClienteRepuestoService,
    @InjectRepository(Client)
    private readonly clientesRepository: Repository<Client>,
    @InjectRepository(ClienteRepuesto)
    private readonly clienteRepuestoRepository: Repository<ClienteRepuesto>
  ) {}

  async findAll(): Promise<Repuesto[]> {
    return this.repuestosRepository.find();
  }

  async findAllClima(): Promise<Repuesto[]> {
    return this.repuestosRepository.find({ where: { clima: true } });
  }

  async findOne(id: number): Promise<Repuesto | null> {
    return this.repuestosRepository.findOneBy({ id });
  }

  async create(repuesto: Repuesto): Promise<Repuesto> {
    // Validación de entrada
    if (!repuesto.precio_compra || !repuesto.precio_venta) {
      throw new BadRequestException('Los precios de compra y venta son requeridos');
    }
    
    if (repuesto.precio_venta <= repuesto.precio_compra) {
      throw new BadRequestException('El precio de venta debe ser mayor al precio de compra');
    }

    // Guardar en el repositorio
    const savedRepuesto = await this.repuestosRepository.save(repuesto);

    // Crear precios especiales para cada cliente
    await this.clienteRepuestoService.createForNewRepuesto(
      savedRepuesto.id,
      savedRepuesto.precio_venta // Usar el precio de venta como base
    );

    return savedRepuesto;
  }

  async delete(id: number): Promise<void> {
    await this.repuestosRepository.delete(id);
  }

  async update(id: number, repuesto: Repuesto): Promise<Repuesto> {
    await this.repuestosRepository.update(id, repuesto);
    return this.findOne(id);
  }

  async getRepuestos(): Promise<Repuesto[]> {
    try {
      return await this.repuestosRepository.find({
        relations: {
          clienteRepuestos: true
        },
        order: {
          familia: 'ASC',
          articulo: 'ASC'
        }
      });
    } catch (error) {
      console.error('Error al obtener repuestos:', error);
      throw new BadRequestException('Error al obtener los repuestos');
    }
  }

  async sincronizarClientesRepuestos(): Promise<{ creados: number }> {
    try {
      // Obtener todos los repuestos con sus relaciones
      const repuestos = await this.repuestosRepository.find({
        relations: {
          clienteRepuestos: {
            cliente: true
          }
        }
      });
      
      if (!repuestos.length) {
        throw new BadRequestException('No hay repuestos para sincronizar');
      }

      // Obtener todos los clientes
      const clientes = await this.clientesRepository.find();
      if (!clientes.length) {
        throw new BadRequestException('No hay clientes para sincronizar');
      }
      
      let creados = 0;
      console.log(`Iniciando sincronización de precios: ${repuestos.length} repuestos y ${clientes.length} clientes encontrados`);

      // Para cada repuesto
      for (const repuesto of repuestos) {
        // Obtener los IDs de clientes que ya tienen precio para este repuesto
        const clientesExistentesIds = repuesto.clienteRepuestos
          .map(cr => cr.cliente.id);

        // Filtrar clientes que no tienen precio para este repuesto
        let clientesFiltrados = clientes.filter(
          cliente => !clientesExistentesIds.includes(cliente.id)
        );
        
        // REGLA DE NEGOCIO: Si el repuesto es de tipo clima (clima=true), 
        // solo sincronizar con clientes que también tengan clima=true.
        // Esto asegura que los repuestos especializados de clima solo se asignen
        // a los clientes que operan equipos de clima.
        if (repuesto.clima === true) {
          const countAntes = clientesFiltrados.length;
          clientesFiltrados = clientesFiltrados.filter(cliente => cliente.clima === true);
          console.log(`Repuesto ID ${repuesto.id} (${repuesto.articulo}) es de tipo clima. Filtrados ${countAntes - clientesFiltrados.length} clientes sin propiedad clima=true`);
        }

        // Crear cliente_repuesto para cada cliente filtrado
        for (const cliente of clientesFiltrados) {
          try {
            await this.clienteRepuestoRepository.save({
              cliente: { id: cliente.id },
              repuesto: { id: repuesto.id },
              precio_venta: repuesto.precio_venta,
              precio_compra: repuesto.precio_compra
            });
            creados++;
            console.log(`Creado precio para cliente ${cliente.id} (${cliente.nombre}) y repuesto ${repuesto.id} (${repuesto.articulo})`);
          } catch (error) {
            console.error(`Error al crear precio para cliente ${cliente.id} y repuesto ${repuesto.id}:`, error);
          }
        }
      }

      console.log(`Sincronización completada. Se crearon ${creados} precios cliente-repuesto`);
      return { creados };
    } catch (error) {
      console.error('Error en sincronizarClientesRepuestos:', error);
      throw new BadRequestException(
        'Error al sincronizar los precios de clientes: ' + 
        (error.message || 'Error desconocido')
      );
    }
  }
}
