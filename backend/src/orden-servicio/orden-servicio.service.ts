import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EstadoServicio, OrdenServicio, TipoOrden } from './orden-servicio.entity';
import { Client } from '../client/client.entity';
import { Locales } from '../locales/locales.entity';
import { User } from '../users/users.entity';
import { SectorTrabajo } from '../sectores-trabajo/sectores-trabajo.entity';
import { TipoServicio } from '../tipo-servicio/tipo-servicio.entity';

@Injectable()
export class OrdenServicioService {
  constructor(
    @InjectRepository(OrdenServicio)
    private ordenServicioRepository: Repository<OrdenServicio>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Locales)
    private localesRepository: Repository<Locales>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SectorTrabajo)
    private sectorTrabajoRepository: Repository<SectorTrabajo>,
    @InjectRepository(TipoServicio)
    private tipoServicioRepository: Repository<TipoServicio>,
  ) {}

  async getOrdenesServicio(): Promise<OrdenServicio[]> {
    return this.ordenServicioRepository.find({
      relations: [
        'tipoServicio',
        'sectorTrabajo',
        'local',
        'client',
        'tecnico',
        'usuarioRechazo',
        'usuarioAprobacion'
      ]
    });
  }

  // contar las ordenes de servicio por estado
  async getOrdenesServicioPorEstado(estado: EstadoServicio, tipoServicioId: number): Promise<number> {
    const reactivosPendientesAutorizacion = await this.ordenServicioRepository.find({ 
      where: { 
        estado: estado, 
        tipoServicio: { id: tipoServicioId } 
      }, 
      relations: [
        'tipoServicio',
        'sectorTrabajo',
        'local',
        'client',
        'tecnico',
        'usuarioRechazo',
        'usuarioAprobacion'
      ]
    });
    return reactivosPendientesAutorizacion.length;
  }

  async getServiciosDelDia(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Fetching services for today:', today, 'until tomorrow:', tomorrow);

    const servicios = await this.ordenServicioRepository.find({
      where: {
        fechaProgramada: Between(today, tomorrow),
        deleted: false
      },
      relations: [
        'tipoServicio',
        'sectorTrabajo',
        'local',
        'client',
        'tecnico',
        'usuarioRechazo',
        'usuarioAprobacion'
      ]
    });

    console.log('Found services:', servicios.length);
    return servicios.length;
  }

  async getProximasVisitasPreventivas(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    console.log('Fetching preventive visits from:', today, 'until:', nextWeek);

    const servicios = await this.ordenServicioRepository.find({
      where: {
        tipoOrden: TipoOrden.PREVENTIVO,
        fechaProgramada: Between(today, nextWeek),
        deleted: false,
        estado: EstadoServicio.PROGRAMADO
      },
      relations: [
        'tipoServicio',
        'sectorTrabajo',
        'local',
        'client',
        'tecnico',
        'usuarioRechazo',
        'usuarioAprobacion'
      ]
    });

    console.log('Found preventive visits:', servicios.length);
    return servicios.length;
  }

  async createOrdenServicio(data: any): Promise<OrdenServicio> {
    const orden = new OrdenServicio();
    
    // Buscar las entidades relacionadas
    const client = await this.clientRepository.findOne({ where: { id: data.clientId } });
    const local = await this.localesRepository.findOne({ where: { id: data.local } });
    const tecnico = await this.userRepository.findOne({ where: { id: data.userId } });
    const sectorTrabajo = await this.sectorTrabajoRepository.findOne({ where: { id: data.sectorTrabajo } });
    const tipoServicio = await this.tipoServicioRepository.findOne({ where: { id: data.tipoServicio } });

    // Asignar las relaciones
    orden.client = client;
    orden.local = local;
    orden.tecnico = tecnico;
    orden.sectorTrabajo = sectorTrabajo;
    orden.tipoServicio = tipoServicio;
    
    // Asignar otros campos
    orden.fechaProgramada = data.fecha;
    orden.observaciones = data.observaciones;
    orden.estado = EstadoServicio.PROGRAMADO;
    orden.tipoOrden = TipoOrden.PREVENTIVO;

    return this.ordenServicioRepository.save(orden);
  }

  async createSolicitudCorrectiva(data: any): Promise<OrdenServicio> {
    const orden = new OrdenServicio();
    
    // Buscar las entidades relacionadas
    const local = await this.localesRepository.findOne({ where: { id: data.numeroLocal } });
    const tecnico = await this.userRepository.findOne({ where: { id: data.inspectorId } });
    const tipoServicio = await this.tipoServicioRepository.findOne({ where: { id: data.especialidad } });
    
    // Asignar las relaciones
    orden.local = local;
    orden.tecnico = tecnico;
    orden.tipoServicio = tipoServicio;
    orden.client = local.client; // Obtenemos el cliente del local
    
    // Asignar otros campos
    orden.tipoOrden = TipoOrden.CORRECTIVO;
    orden.estado = EstadoServicio.ESPERANDO_APROBACION;
    orden.observaciones = data.observaciones;
    orden.costoEstimado = data.costoEstimado ? parseFloat(data.costoEstimado) : null;
    orden.requiereAprobacion = true;
    orden.imagenes = data.file ? [{
      url: data.file,
      nombre: 'Imagen de solicitud correctiva',
      fechaSubida: new Date(),
      tipo: 'antes',
      usuarioSubida: data.inspectorId
    }] : null;

    // Guardar detalles adicionales en detalleServicio
    orden.detalleServicio = {
      criticidad: data.criticidad,
      afecta: data.afecta,
      tiempoEstimado: data.tiempoEstimado
    };

    return this.ordenServicioRepository.save(orden);
  }
}
