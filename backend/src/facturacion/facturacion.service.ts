import { Injectable } from '@nestjs/common';
import { Facturacion } from './facturacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../client/client.entity';

@Injectable()
export class FacturacionService {
    constructor(
        @InjectRepository(Facturacion)
        private readonly facturacionRepository: Repository<Facturacion>,
        @InjectRepository(Client)
        private readonly clienteRepository: Repository<Client>,
    ) {}

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
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];

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
                
                // Asegurarse de que las fechas sean válidas
                if (fecha_inicio.getFullYear() !== anio) {
                    continue;
                }

                await this.crearFacturacion(
                    cliente, 
                    `${meses[mes]} ${anio}`, 
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

        const anioActual = new Date().getFullYear();
        const ANIOS_FACTURACION = 2;
        
        await this.generarFacturacionMensual(cliente, anioActual, ANIOS_FACTURACION);
        
        return cliente;
    }
}

