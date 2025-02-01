import { Injectable } from '@nestjs/common';
import { Facturacion } from './facturacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../client/client.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FacturacionService {
    constructor(
        @InjectRepository(Facturacion)
        private readonly facturacionRepository: Repository<Facturacion>,
        @InjectRepository(Client)
        private readonly clienteRepository: Repository<Client>,
    ) {}

    private getMesFormateado(fecha: Date): string {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    }

    async crearFacturacion(
        cliente: Client,
        mes: string,
        fecha_inicio: Date,
        fecha_termino: Date,
        hh: number = 720,
    ): Promise<Facturacion> {
        const facturacion = this.facturacionRepository.create({
            cliente,
            mes,
            fecha_inicio,
            fecha_termino,
            hh,
        });
        return this.facturacionRepository.save(facturacion);
    }

    async listarFacturacionPorCliente(id_cliente: number): Promise<Facturacion[]> {
        return this.facturacionRepository.find({
            where: { cliente: { id: id_cliente } },
            relations: ['cliente'],
        });
    }


    

    async generarFacturacionMensual(cliente: Client, anio_inicio: number, anios: number) {
        // Validar que el año de inicio sea válido
        const currentYear = new Date().getFullYear();
        if (anio_inicio < currentYear - 100 || anio_inicio > currentYear + 100) {
            anio_inicio = currentYear;
        }

        // Limitar la cantidad de años a generar
        if (anios > 10) {
            anios = 10;
        }

        for (let anio = anio_inicio; anio < anio_inicio + anios; anio++) {
            for (let mes = 0; mes < 12; mes++) {
                const fecha_inicio = new Date(anio, mes, 1);
                const fecha_termino = new Date(anio, mes + 1, 0);
                
                if (fecha_inicio.getFullYear() !== anio) {
                    continue;
                }

                await this.crearFacturacion(
                    cliente, 
                    this.getMesFormateado(fecha_inicio),
                    fecha_inicio, 
                    fecha_termino, 
                    0
                );
            }
        }
    }

    async actualizarMesDeFacturacion(id: number, fecha_inicio: Date, fecha_termino: Date) {
        const fechaInicioFormateada = fecha_inicio.toISOString().split('T')[0];
        const fechaTerminoFormateada = fecha_termino.toISOString().split('T')[0];
        
        return this.facturacionRepository.update(id, { 
            fecha_inicio: fechaInicioFormateada, 
            fecha_termino: fechaTerminoFormateada 
        });
    }

    async generarFacturacionMensualAutomatica(id_cliente: number, anio_inicio: number, anios: number) {
        const cliente = await this.clienteRepository.findOne({ 
            where: { id: id_cliente }, 
            relations: ['facturaciones'] 
        });
        
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        const mesActual = new Date().getMonth();
        const anioActual = new Date().getFullYear();

        const fecha_inicio = new Date(anioActual, mesActual, 1);
        const fecha_termino = new Date(anioActual, mesActual + 1, 0);

        await this.crearFacturacion(
            cliente, 
            this.getMesFormateado(fecha_inicio),
            fecha_inicio, 
            fecha_termino, 
            0
        );
        
        return cliente;
    }

    @Cron('59 23 28-31 * *') // Se ejecuta a las 23:59 los días 28-31 de cada mes
    async generarFacturacionMensualParaTodosLosClientes() {
        // Verificar si es el último día del mes
        const hoy = new Date();
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);
        
        // Solo ejecutar si mañana es el primer día del siguiente mes
        if (mañana.getDate() !== 1) {
            return;
        }

        try {
            const clientes = await this.clienteRepository.find({
                where: { activo: true }
            });

            const mesActual = hoy.getMonth();
            const anioActual = hoy.getFullYear();
            const primerDiaMesActual = new Date(anioActual, mesActual, 1);
            const ultimoDiaMesActual = new Date(anioActual, mesActual + 1, 0);
            
            const mesProximo = (hoy.getMonth() + 1) % 12;
            const anioProximo = hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
            const primerDiaProximoMes = new Date(anioProximo, mesProximo, 1);
            const ultimoDiaProximoMes = new Date(anioProximo, mesProximo + 1, 0);

            for (const cliente of clientes) {
                const facturaExistenteMesActual = await this.facturacionRepository.findOne({
                    where: {
                        cliente: { id: cliente.id },
                        fecha_inicio: primerDiaMesActual
                    }
                });

                if (!facturaExistenteMesActual) {
                    await this.crearFacturacion(
                        cliente,
                        this.getMesFormateado(primerDiaMesActual),
                        primerDiaMesActual,
                        ultimoDiaMesActual,
                        0
                    );
                }

                const facturaExistente = await this.facturacionRepository.findOne({
                    where: {
                        cliente: { id: cliente.id },
                        fecha_inicio: primerDiaProximoMes
                    }
                });

                if (!facturaExistente) {
                    await this.crearFacturacion(
                        cliente,
                        this.getMesFormateado(primerDiaProximoMes),
                        primerDiaProximoMes,
                        ultimoDiaProximoMes,
                        0
                    );
                }
            }
        } catch (error) {
            console.error('Error al generar facturación mensual:', error);
        }
    }

    async create(createFacturacionDto: any) {
        const facturacion = this.facturacionRepository.create({
            ...createFacturacionDto,
            mes: createFacturacionDto.mes || this.getMesFormateado(new Date())
        });
        return await this.facturacionRepository.save(facturacion);
    }
}

