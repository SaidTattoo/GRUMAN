import { Injectable } from '@nestjs/common';
import { SolicitarVisita } from './solicitar-visita.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/client/client.entity';
import { Locales } from 'src/locales/locales.entity';

@Injectable()
export class SolicitarVisitaService {
    constructor(
        @InjectRepository(SolicitarVisita)
        private solicitarVisitaRepository: Repository<SolicitarVisita>,
        @InjectRepository(Locales)
        private localesRepository: Repository<Locales>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
    ) {}

    async crearSolicitudVisita(solicitud: any): Promise<SolicitarVisita> {
        const solicitudVisita = new SolicitarVisita();
      
        // Asigna valores
        solicitudVisita.tipoServicioId = solicitud.tipoServicioId;
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
        return this.solicitarVisitaRepository.findOne({ where: { id }, relations: ['local'] });
    }

    getSolicitudesVisita(): Promise<SolicitarVisita[]> {
        return this.solicitarVisitaRepository.find({ relations: ['local', 'client'] });
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
}
