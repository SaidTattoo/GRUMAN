import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SolicitarVisita } from './solicitar-visita.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/client/client.entity';
import { Locales } from 'src/locales/locales.entity';
import { TipoServicio } from 'src/tipo-servicio/tipo-servicio.entity';
import { User } from 'src/users/users.entity';
import { ItemRepuesto } from 'src/inspection/entities/item-repuesto.entity';
import { FinalizarServicioDto } from './dto/finalizar-servicio.dto';
import { In, Between } from 'typeorm';
import { FacturacionService } from 'src/facturacion/facturacion.service';


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
        @InjectRepository(ItemRepuesto)
        private itemRepuestoRepository: Repository<ItemRepuesto>,
        private facturacionService: FacturacionService
    ) {}

    /**
     * Crea una nueva solicitud de visita técnica
     * @param solicitud - Objeto con los datos de la solicitud
     * @returns Promise<SolicitarVisita> - Retorna la solicitud creada
     */
    async crearSolicitudVisita(solicitud: any): Promise<SolicitarVisita> {
        const solicitudVisita = new SolicitarVisita();
      
      
        // Busca y asigna el tipo de servicio seleccionado
        const tipoServicio = await this.tipoServicioRepository.findOne({ where: { id: solicitud.tipoServicioId } });
        solicitudVisita.tipoServicioId = tipoServicio.id;

        // Busca y asigna el local y cliente relacionados
        solicitudVisita.local = await this.localesRepository.findOne({ where: { id: solicitud.localId } });
        solicitudVisita.client = await this.clientRepository.findOne({ where: { id: solicitud.clientId } });

        // Asigna los datos básicos de la solicitud
        solicitudVisita.sectorTrabajoId = solicitud.sectorTrabajoId;
        solicitudVisita.especialidad = solicitud.especialidad;
        solicitudVisita.ticketGruman = solicitud.ticketGruman;
        solicitudVisita.observaciones = solicitud.observaciones;
        solicitudVisita.fechaIngreso = solicitud.fechaIngreso;
        solicitudVisita.imagenes = solicitud.imagenes;
        solicitudVisita.tipo_mantenimiento = solicitud.tipo_mantenimiento;

        // Asigna el técnico si fue especificado
        if (solicitud.tecnico_asignado_id) {
            solicitudVisita.tecnico_asignado = await this.userRepository.findOne({ 
                where: { id: solicitud.tecnico_asignado_id } 
            });
        }

        // Valida que no exista otra solicitud para el mismo cliente en el período específico
        const facturacion = await this.facturacionService.listarFacturacionPorCliente(solicitudVisita.client.id);    
        const fechaIngreso = new Date(solicitudVisita.fechaIngreso);
        
        // Busca si la fecha de ingreso está dentro de algún período de facturación
        const periodoCorrespondiente = facturacion.find(periodo => {
            const fechaInicio = new Date(periodo.fecha_inicio);
            const fechaTermino = new Date(periodo.fecha_termino);
            return fechaIngreso >= fechaInicio && fechaIngreso <= fechaTermino;
        });

        if (!periodoCorrespondiente) {
            throw new BadRequestException('La fecha de ingreso no corresponde a ningún período de facturación válido');
        }

        // Busca solicitudes existentes en el mismo período específico
        const solicitudesExistentes = await this.solicitarVisitaRepository.find({
            where: {
                client: { id: solicitudVisita.client.id },
                fechaIngreso: Between(
                    new Date(periodoCorrespondiente.fecha_inicio),
                    new Date(periodoCorrespondiente.fecha_termino)
                )
            }
        });

        if (solicitudesExistentes.length > 0) {
            throw new BadRequestException('Ya existe una solicitud de visita programada para este cliente en el período seleccionado');
        }

        // Si la solicitud está aprobada, asigna el aprobador
        if (solicitud.status === 'aprobada' && solicitud.aprobada_por_id) {
            solicitudVisita.status = 'aprobada';
            solicitudVisita.aprobada_por = await this.userRepository.findOne({ 
                where: { id: solicitud.aprobada_por_id } 
            });
            solicitudVisita.aprobada_por_id = solicitud.aprobada_por_id;
        }

        // Guarda y retorna la solicitud creada
        return await this.solicitarVisitaRepository.save(solicitudVisita);
    }

    getSolicitudVisita(id: number): Promise<SolicitarVisita> {

        
        return this.solicitarVisitaRepository.findOne({ 
          where: { id }, 
          relations: [
            'local', 
            'client', 
            'tecnico_asignado',
            'itemRepuestos',
            'itemRepuestos.repuesto'
          ] 
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
            where: { status: In(['aprobada', 'aprobado']) },
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


  async getSolicitudByIdItems(id: number): Promise<SolicitarVisita> {
    return this.solicitarVisitaRepository.findOne({ 
      where: { id },
      relations: ['itemRepuestos','local','client','tecnico_asignado']
    });
  }




    async getSolicitudesFinalizadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In(['finalizado', 'finalizada']) },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
        return data;
    }
    
    async getSolicitudesValidadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In(['validada', 'reabierta']) },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
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
        await this.solicitarVisitaRepository.update(id, { status: 'finalizado' });
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
      const visita = await this.solicitarVisitaRepository.findOne({ 
        where: { id }
      });

      if (!visita) {
        throw new NotFoundException(`Visita con ID ${id} no encontrada`);
      }

      await this.solicitarVisitaRepository.update(id, {
        ...solicitud,
        fecha_hora_validacion: new Date()
       
      });

      return this.solicitarVisitaRepository.findOne({ 
        where: { id },
        relations: ['local', 'client', 'tecnico_asignado']
      });
    }
    /* agregar fecha_hora_inicio_servicio  */
    async iniciarServicio(id: number, latitud: string, longitud: string): Promise<SolicitarVisita> {
        await this.solicitarVisitaRepository.update(id, { 
            status: 'en_servicio', 
            fecha_hora_inicio_servicio: new Date(), 
            latitud_movil: latitud,
            longitud_movil: longitud
        });
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }
/* agregar fecha_hora_fin_servicio */
    async finalizarServicio(id: number, data: FinalizarServicioDto): Promise<SolicitarVisita> {
        const visita = await this.solicitarVisitaRepository.findOne({ 
            where: { id },
            relations: ['itemRepuestos']
        });

        if (!visita) {
            throw new NotFoundException(`Visita con ID ${id} no encontrada`);
        }

        // Guardar firma
        visita.firma_cliente = data.firma_cliente;
        visita.status = 'finalizado';
        visita.fecha_hora_fin_servicio = new Date();

        // Primero guardamos la visita para asegurarnos de tener el ID
        const visitaGuardada = await this.solicitarVisitaRepository.save(visita);

        // Guardar repuestos
        if (data.repuestos) {
            for (const itemId in data.repuestos) {
                const repuestosArray = data.repuestos[itemId];
                for (const repuestoData of repuestosArray) {
                    const itemRepuesto = new ItemRepuesto();
                    itemRepuesto.cantidad = repuestoData.cantidad;
                    itemRepuesto.comentario = repuestoData.comentario;
                    itemRepuesto.repuesto = repuestoData.repuesto;
                    itemRepuesto.solicitarVisitaId = visitaGuardada.id; // Establecemos explícitamente el ID
                    itemRepuesto.itemId = parseInt(itemId);
                    await this.itemRepuestoRepository.save(itemRepuesto);
                }
            }
        }

        return visitaGuardada;
    }

    async reabrirSolicitud(id: number): Promise<SolicitarVisita> {
        const visita = await this.solicitarVisitaRepository.findOne({ 
            where: { id }
        });

        if (!visita) {
            throw new NotFoundException(`Visita con ID ${id} no encontrada`);
        }

        // Actualizar el estado a reabierta
        visita.status = 'reabierta';
        
        return this.solicitarVisitaRepository.save(visita);
    }


    async validarSolicitud(id: number, validada_por_id: number): Promise<SolicitarVisita> {
        const visita = await this.solicitarVisitaRepository.findOne({ 
            where: { id }
        });

        if (!visita) {
            throw new NotFoundException(`Visita con ID ${id} no encontrada`);
        }

        // Guardar los repuestos temporales
        
        console.log('visita', visita);
        // Combinar los datos de validación con los datos actualizados del formulario
        const updateData = { 
            ...visita,
            status: 'validada', 
            validada_por_id: validada_por_id,
            fecha_hora_validacion: new Date(),
            especialidad: visita.especialidad,
            ticketGruman: visita.ticketGruman,
            observaciones: visita.observaciones,
            longitud_movil: visita.longitud_movil,
            latitud_movil: visita.latitud_movil,
        };
        
        // Actualizar la entidad con todos los cambios
        await this.solicitarVisitaRepository.update(id, updateData);
        
        // Retornar la entidad actualizada con sus relaciones
        return this.solicitarVisitaRepository.findOne({ 
            where: { id },
            relations: ['local', 'client', 'tecnico_asignado', 'itemRepuestos', 'itemRepuestos.repuesto']
        });
    }
}
