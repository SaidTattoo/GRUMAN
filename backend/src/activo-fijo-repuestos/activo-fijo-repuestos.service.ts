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
            const solicitud = await this.solicitudRepository.findOne({
                where: { id: solicitudId },
                relations: ['local', 'local.activoFijoLocales']
            });

            if (!solicitud) {
                throw new NotFoundException('Solicitud no encontrada');
            }

            const repuestosSaved = [];

            for (const activoFijoData of data.activoFijoRepuestos) {
                // Validar que el activo fijo pertenece al local
                const activoFijo = solicitud.local.activoFijoLocales.find(
                    af => af.id === activoFijoData.activoFijoId
                );

                if (!activoFijo) {
                    throw new BadRequestException(
                        `El activo fijo ${activoFijoData.activoFijoId} no pertenece al local`
                    );
                }

                // Crear el registro principal de ActivoFijoRepuestos
                const activoFijoRepuestos = manager.create(ActivoFijoRepuestos, {
                    solicitarVisita: solicitud,
                    activoFijo,
                    estadoOperativo: activoFijoData.estadoOperativo,
                    observacionesEstado: activoFijoData.observacionesEstado
                });

                const savedActivoFijoRepuestos = await manager.save(activoFijoRepuestos);

                // Procesar cada repuesto
                for (const repuestoData of activoFijoData.repuestos) {
                    const detalleRepuesto = manager.create(DetalleRepuestoActivoFijo, {
                        activoFijoRepuestos: savedActivoFijoRepuestos,
                        repuesto: { id: repuestoData.repuestoId },
                        cantidad: repuestoData.cantidad,
                        comentario: repuestoData.comentario,
                        estado: repuestoData.estado,
                        precio_unitario: repuestoData.precio_unitario
                    });

                    await manager.save(detalleRepuesto);
                }

                repuestosSaved.push(savedActivoFijoRepuestos);
            }

            return repuestosSaved;
        });
    }

    async obtenerRepuestosPorSolicitud(solicitudId: number) {
        return await this.activoFijoRepuestosRepository.find({
            where: { solicitarVisita: { id: solicitudId } },
            relations: [
                'activoFijo',
                'detallesRepuestos',
                'detallesRepuestos.repuesto'
            ]
        });
    }
} 