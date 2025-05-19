import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ActivoFijoRepuestos } from './entities/activo-fijo-repuestos.entity';
import { DetalleRepuestoActivoFijo } from './entities/detalle-repuesto-activo-fijo.entity';
import { SolicitarVisita } from '../solicitar-visita/solicitar-visita.entity';

@Injectable()
export class ActivoFijoRepuestosService {
    constructor(
        @InjectRepository(ActivoFijoRepuestos)
        private activoFijoRepuestosRepository: Repository<ActivoFijoRepuestos>,
        @InjectRepository(DetalleRepuestoActivoFijo)
        private detalleRepuestoRepository: Repository<DetalleRepuestoActivoFijo>,
        @InjectRepository(SolicitarVisita)
        private solicitudRepository: Repository<SolicitarVisita>,
        private dataSource: DataSource
    ) {}

    async guardarRepuestosActivoFijo(solicitudId: number, data: any) {
        return await this.dataSource.transaction(async manager => {
            // Find the solicitud with its relations
            const solicitud = await this.solicitudRepository.findOne({
                where: { id: solicitudId },
                relations: ['local', 'local.activoFijoLocales']
            });

            if (!solicitud) {
                throw new NotFoundException('Solicitud no encontrada');
            }

            const repuestosSaved = [];

            // Process each activoFijoRepuesto
            for (const activoFijoData of data.activoFijoRepuestos) {
                // Validate activo fijo belongs to local
                const activoFijo = solicitud.local.activoFijoLocales.find(
                    af => af.id === activoFijoData.activoFijoId
                );

                if (!activoFijo) {
                    throw new BadRequestException(
                        `El activo fijo ${activoFijoData.activoFijoId} no pertenece al local`
                    );
                }

                // Create new ActivoFijoRepuestos instance
                const activoFijoRepuestos = new ActivoFijoRepuestos();
                activoFijoRepuestos.solicitarVisita = solicitud;
                activoFijoRepuestos.activoFijo = activoFijo;
                activoFijoRepuestos.estadoOperativo = activoFijoData.estadoOperativo;
                activoFijoRepuestos.observacionesEstado = activoFijoData.observacionesEstado;
                activoFijoRepuestos.fechaRevision = new Date();

                // Save the main record
                const savedActivoFijoRepuestos = await manager.save(ActivoFijoRepuestos, activoFijoRepuestos);

                // Process repuestos if they exist
                if (activoFijoData.repuestos && activoFijoData.repuestos.length > 0) {
                    for (const repuestoData of activoFijoData.repuestos) {
                        const detalleRepuesto:any = new DetalleRepuestoActivoFijo();
                        detalleRepuesto.activoFijoRepuestos = savedActivoFijoRepuestos;
                        detalleRepuesto.repuesto = { id: repuestoData.repuesto.id };
                        detalleRepuesto.cantidad = repuestoData.cantidad;
                        detalleRepuesto.comentario = repuestoData.comentario;
                        detalleRepuesto.estado = repuestoData.estado;
                        detalleRepuesto.precio_unitario = repuestoData.precio_unitario;

                        await manager.save(DetalleRepuestoActivoFijo, detalleRepuesto);
                    }
                }

                repuestosSaved.push(savedActivoFijoRepuestos);
            }

            return repuestosSaved;
        });
    }

    async obtenerRepuestosPorSolicitud(solicitudId: number) {
        return await this.activoFijoRepuestosRepository.find({
            where: { solicitarVisita: { id: solicitudId } },
            relations: {
                activoFijo: true,
                detallesRepuestos: {
                    repuesto: true
                },
                solicitarVisita: true
            }
        });
    }
} 