import { Injectable } from '@nestjs/common';
import { Facturacion } from './facturacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../client/client.entity';
import { Like } from 'typeorm';

@Injectable()
export class FacturacionService {
    constructor(
        @InjectRepository(Facturacion)
        private readonly facturacionRepository: Repository<Facturacion>,
        @InjectRepository(Client)
        private readonly clienteRepository: Repository<Client>,
    ) {
        // Verificar que el repositorio está inyectado correctamente
        console.log('Repositorio inyectado:', !!this.facturacionRepository);
    }

    private getMesFormateado(fecha: Date): string {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    }

    async findFacturacionByMesAndIdCliente(mes: string, id_cliente: number): Promise<Facturacion[]> {
        console.log('Buscando facturación con mes:', mes, 'y cliente:', id_cliente);
        
        const facturaciones = await this.facturacionRepository
            .createQueryBuilder('facturacion')
            .select(['facturacion.id', 'facturacion.mes'])
            .where('facturacion.cliente = :clienteId', { clienteId: id_cliente })
            .andWhere('facturacion.mes = :mes', { mes: mes })
            .limit(1)
            .getMany();
        
        console.log('Facturaciones encontradas:', facturaciones);
        return facturaciones;
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

    async obtenerFacturaciones() {
        console.log('Obteniendo todas las facturaciones');
        try {
            const facturaciones = await this.facturacionRepository.find();
            console.log(`Se encontraron ${facturaciones.length} facturaciones`);
            return facturaciones;
        } catch (error) {
            console.error('Error al obtener facturaciones:', error);
            throw error;
        }
    }

    async obtenerMesesUnicos(): Promise<string[]> {
        try {
            console.log('Iniciando búsqueda de meses únicos - usando QueryBuilder');
            
            // Verificar si hay registros en la tabla
            const count = await this.facturacionRepository.count();
            console.log(`Número total de registros en la tabla facturacion: ${count}`);
            
            if (count === 0) {
                console.log('No hay registros en la tabla, retornando lista hardcoded');
                return this.mesesHardcoded();
            }
            
            // Usar el QueryBuilder en lugar de SQL directo
            const result = await this.facturacionRepository
                .createQueryBuilder('facturacion')
                .select('facturacion.mes', 'mes')
                .distinct(true)
                .orderBy('facturacion.fecha_inicio', 'ASC')
                .getRawMany();
            
            console.log('Resultado del QueryBuilder:', result);
            
            // Extraer solo los valores de mes
            const meses = result.map(item => item.mes).filter(mes => mes !== null);
            console.log('Meses extraídos:', meses);
            
            return meses.length > 0 ? meses : this.mesesHardcoded();
        } catch (error) {
            console.error('Error al obtener meses únicos:', error);
            console.log('Fallback a lista hardcoded debido a error');
            return this.mesesHardcoded();
        }
    }
    
    private mesesHardcoded(): string[] {
        return [
            'Enero 2025',
            'Febrero 2025',
            'Marzo 2025',
            'Abril 2025',
            'Mayo 2025',
            'Junio 2025',
            'Julio 2025',
            'Agosto 2025',
            'Septiembre 2025',
            'Octubre 2025',
            'Noviembre 2025',
            'Diciembre 2025',
            'Enero 2026',
            'Febrero 2026',
            'Marzo 2026',
            'Abril 2026',
            'Mayo 2026',
            'Junio 2026',
            'Julio 2026',
            'Agosto 2026',
            'Septiembre 2026',
            'Octubre 2026',
            'Noviembre 2026',
            'Diciembre 2026'
        ];
    }
}

