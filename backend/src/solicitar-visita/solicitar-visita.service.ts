import { Injectable } from '@nestjs/common';
import { SolicitarVisita } from './solicitar-visita.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/client/client.entity';
import { Locales } from 'src/locales/locales.entity';
import { TipoServicio } from 'src/tipo-servicio/tipo-servicio.entity';
import { User } from 'src/users/users.entity';


@Injectable()
export class SolicitarVisitaService {
    constructor(
        @InjectRepository(SolicitarVisita)
        private solicitarVisitaRepository: Repository<SolicitarVisita>,
        @InjectRepository(Locales)
        private localesRepository: Repository<Locales>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(TipoServicio)
        private tipoServicioRepository: Repository<TipoServicio>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async crearSolicitudVisita(solicitud: any): Promise<SolicitarVisita> {
        const solicitudVisita = new SolicitarVisita();
      
        // Asigna valores
        const tipoServicio = await this.tipoServicioRepository.findOne({ where: { id: solicitud.tipoServicioId } });
        solicitudVisita.tipoServicioId = tipoServicio.id;
        solicitudVisita.local = await this.localesRepository.findOne({ where: { id: solicitud.localId } });
        solicitudVisita.client = await this.clientRepository.findOne({ where: { id: solicitud.clientId } });
        solicitudVisita.sectorTrabajoId = solicitud.sectorTrabajoId;
        solicitudVisita.especialidad = solicitud.especialidad;
        solicitudVisita.ticketGruman = solicitud.ticketGruman;
        solicitudVisita.observaciones = solicitud.observaciones;
        solicitudVisita.fechaIngreso = solicitud.fechaIngreso;
        solicitudVisita.imagenes = solicitud.imagenes;
      
        return await this.solicitarVisitaRepository.save(solicitudVisita);
    }

    getSolicitudVisita(id: number): Promise<SolicitarVisita> {
        return this.solicitarVisitaRepository.findOne({ 
          where: { id }, 
          relations: ['local', 'client', 'tecnico_asignado'] 
        });
    }


    getSolicitudesVisita(): Promise<SolicitarVisita[]> {
        return this.solicitarVisitaRepository.find({ 
          relations: ['local', 'client', 'tecnico_asignado'],
          order: { fechaIngreso: 'DESC' }
        });
    }

    async getSolicitudesAprobadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: 'aprobado' },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
        console.log('[Solicitudes Aprobadas]:', JSON.stringify(data, null, 2));
        return data;
    }


    async solicitudesPorTecnico(rut: string): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { tecnico_asignado: { rut } },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
        return data;
    }

    async getSolicitudesRechazadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: 'rechazado' },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
        console.log('[Solicitudes Rechazadas]:', JSON.stringify(data, null, 2));
        return data;
    }

    async aprovarSolicitudVisita(id: number): Promise<SolicitarVisita> {
       await this.solicitarVisitaRepository.update(id, { status: 'aprobado' });
       
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }

    async rechazarSolicitudVisita(id: number): Promise<SolicitarVisita> {
         await this.solicitarVisitaRepository.update(id, { status: 'rechazado' });
        
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }

    async finalizarSolicitudVisita(id: number): Promise<SolicitarVisita> {
        await this.solicitarVisitaRepository.update(id, { status: 'finalizada' });
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }

    //quiero obtener la cantidad de solicitudes pendientes
    async getPendientes(): Promise<number> {
        const pendientes = await this.solicitarVisitaRepository.count({
            where: { status: 'pendiente' }
        });
        return pendientes;
    }

    async updateSolicitudVisita(id: number, solicitud: any): Promise<SolicitarVisita> {
      if (solicitud.tecnico_asignado_id) {
        const tecnico = await this.userRepository.findOne({ where: { id: solicitud.tecnico_asignado_id } });
        if (!tecnico) {
          throw new Error('Técnico no encontrado');
        }
        solicitud.tecnico_asignado = tecnico;
      }
      await this.solicitarVisitaRepository.update(id, solicitud);
      return this.solicitarVisitaRepository.findOne({ 
        where: { id },
        relations: ['local', 'client', 'tecnico_asignado']
      });
    }
}
