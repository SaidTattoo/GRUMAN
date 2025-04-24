import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, IsNull, Not } from 'typeorm';
import { SolicitarVisita, SolicitudStatus } from '../solicitar-visita/solicitar-visita.entity';
import { Client } from '../client/client.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(SolicitarVisita)
        private solicitarVisitaRepository: Repository<SolicitarVisita>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>
    ) {}

    /**
     * Obtiene contadores de solicitudes en diferentes estados
     * @param clientId ID del cliente para filtrar (opcional)
     * @returns Objeto con contadores
     */
    async getContadores(clientId?: number): Promise<{
        pendientes: number;
        aprobadas: number;
        rechazadas: number;
        enServicio: number;
        finalizadas: number;
        validadas: number;
        total: number;
    }> {
        // Construir la query base
        console.log('clientId', clientId);
        const queryBuilder = this.solicitarVisitaRepository.createQueryBuilder('solicitud')
            .leftJoinAndSelect('solicitud.client', 'client');
        
        // Si se proporciona un clientId, filtrar por cliente
        if (clientId) {
            queryBuilder.where('client.id = :clientId', { clientId });
        }

        // Contar todas las solicitudes (total)
        const total = await queryBuilder.getCount();

        // Contar solicitudes pendientes
        const pendientes = await this.solicitarVisitaRepository.count({
            where: {
                status: SolicitudStatus.PENDIENTE,
                client: { id: clientId }
            },
            relations: ['client']
        });

        // Contar solicitudes aprobadas
        const aprobadas = await this.solicitarVisitaRepository.count({
            where: {
                status: SolicitudStatus.APROBADA,
                client: { id: clientId }
            },
            relations: ['client']
        });

        // Contar solicitudes rechazadas
        const rechazadas = await this.solicitarVisitaRepository.count({
            where: {
                status: SolicitudStatus.RECHAZADA,
                client: { id: clientId }
            },
            relations: ['client']
        });

        // Contar solicitudes en servicio
        const enServicio = await this.solicitarVisitaRepository.count({
            where: {
                status: SolicitudStatus.APROBADA,
                fecha_hora_inicio_servicio: Not(IsNull()),
                fecha_hora_fin_servicio: IsNull(),
                client: { id: clientId }
            },
            relations: ['client']
        });

        // Contar solicitudes finalizadas
        const finalizadas = await this.solicitarVisitaRepository.count({
            where: {
                status: SolicitudStatus.FINALIZADA,
                client: { id: clientId }
            },
            relations: ['client']
        });

        // Contar solicitudes validadas
        const validadas = await this.solicitarVisitaRepository.count({
            where: [
                { status: SolicitudStatus.VALIDADA, client: { id: clientId } },
                { status: SolicitudStatus.REABIERTA, client: { id: clientId } }
            ],
            relations: ['client']
        });

        return {
            pendientes,
            aprobadas,
            rechazadas,
            enServicio,
            finalizadas,
            validadas,
            total
        };
    }

    /**
     * Obtiene estadísticas por cliente
     * @returns Array de clientes con sus contadores
     */
    async getEstadisticasPorCliente(): Promise<any[]> {
        const clients = await this.solicitarVisitaRepository
            .createQueryBuilder('solicitud')
            .select('client.id', 'clientId')
            .addSelect('client.nombre', 'clientNombre')
            .addSelect('client.logo', 'clientLogo')
            .addSelect('COUNT(solicitud.id)', 'total')
            .addSelect('SUM(CASE WHEN solicitud.status = :pendiente THEN 1 ELSE 0 END)', 'pendientes')
            .addSelect('SUM(CASE WHEN solicitud.status = :aprobado THEN 1 ELSE 0 END)', 'aprobadas')
            .addSelect('SUM(CASE WHEN solicitud.status = :rechazado THEN 1 ELSE 0 END)', 'rechazadas')
            .addSelect('SUM(CASE WHEN solicitud.status = :finalizado THEN 1 ELSE 0 END)', 'finalizadas')
            .addSelect('SUM(CASE WHEN solicitud.status IN (:validada, :reabierta) THEN 1 ELSE 0 END)', 'validadas')
            .addSelect('SUM(CASE WHEN solicitud.status = :archivada THEN 1 ELSE 0 END)', 'archivadas')
            .addSelect(`SUM(CASE 
                WHEN solicitud.status = :aprobado 
                AND solicitud.fecha_hora_inicio_servicio IS NOT NULL 
                AND solicitud.fecha_hora_fin_servicio IS NULL 
                THEN 1 ELSE 0 END)`, 'enProceso')
            .leftJoin('solicitud.client', 'client')
            .groupBy('client.id')
            .addGroupBy('client.nombre')
            .addGroupBy('client.logo')
            .setParameters({
                pendiente: 'pendiente',
                aprobado: 'aprobado',
                rechazado: 'rechazado',
                finalizado: 'finalizado',
                validada: 'validada',
                reabierta: 'reabierta',
                archivada: 'archivada'
            })
            .getRawMany();

        return clients;
    }

    /**
     * Obtiene estadísticas mensuales para un año específico
     * @param year Año para las estadísticas (por defecto, el año actual)
     * @param clientId ID del cliente para filtrar (opcional)
     * @returns Estadísticas mensuales
     */
    async getEstadisticasMensuales(year: number = new Date().getFullYear(), clientId?: number): Promise<any> {
        const meses = [];
        
        for (let mes = 0; mes < 12; mes++) {
            const startDate = new Date(year, mes, 1);
            const endDate = new Date(year, mes + 1, 0);
            
            const queryBuilder = this.solicitarVisitaRepository.createQueryBuilder('solicitud')
                .leftJoinAndSelect('solicitud.client', 'client')
                .where('solicitud.fechaIngreso BETWEEN :startDate AND :endDate', { 
                    startDate, 
                    endDate 
                });
            
            // Solo aplicar el filtro de cliente si no es GRUMAN
            if (clientId) {
                const client = await this.clientRepository.findOne({ where: { id: clientId } });
                if (client && client.nombre.toUpperCase() !== 'GRUMAN') {
                    queryBuilder.andWhere('client.id = :clientId', { clientId });
                }
            }
            
            const total = await queryBuilder.getCount();
            
            // Función auxiliar para contar solicitudes
            const countSolicitudes = async (status: string | string[], includeReabierta = false) => {
                const whereConditions: any = {
                    fechaIngreso: Between(startDate, endDate),
                };

                if (clientId) {
                    const client = await this.clientRepository.findOne({ where: { id: clientId } });
                    if (client && client.nombre.toUpperCase() !== 'GRUMAN') {
                        whereConditions.client = { id: clientId };
                    }
                }

                if (Array.isArray(status)) {
                    return await this.solicitarVisitaRepository.count({
                        where: status.map(s => ({
                            ...whereConditions,
                            status: s
                        })),
                        relations: ['client']
                    });
                } else {
                    whereConditions.status = status;
                    return await this.solicitarVisitaRepository.count({
                        where: whereConditions,
                        relations: ['client']
                    });
                }
            };

            const pendientes = await countSolicitudes(SolicitudStatus.PENDIENTE);
            const aprobadas = await countSolicitudes(SolicitudStatus.APROBADA);
            const finalizadas = await countSolicitudes(SolicitudStatus.FINALIZADA);
            const rechazadas = await countSolicitudes(SolicitudStatus.RECHAZADA);
            const validadas = await countSolicitudes([SolicitudStatus.VALIDADA, SolicitudStatus.REABIERTA]);
            const atendida_en_proceso = await countSolicitudes(SolicitudStatus.ATENDIDA_EN_PROCESO);
            const en_servicio = await countSolicitudes(SolicitudStatus.EN_SERVICIO);
            
            meses.push({
                mes: mes + 1,
                nombre: this.getNombreMes(mes),
                total,
                pendientes,
                aprobadas,
                finalizadas,
                rechazadas,
                validadas,
                atendida_en_proceso,
                en_servicio
            });
        }
        
        return { year, meses };
    }

    /**
     * Obtiene el nombre del mes según su índice (0-11)
     * @param mes Índice del mes (0-11)
     * @returns Nombre del mes en español
     */
    private getNombreMes(mes: number): string {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes];
    }
}
