import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformesConsumo } from '../entities/informes-consumo.entity';

@Injectable()
export class InformeConsumoService {
  constructor(
    @InjectRepository(InformesConsumo)
    private readonly informeConsumoRepository: Repository<InformesConsumo>,
  ) {}

  async getInformeConsumo(
    fechaInicio?: string,
    fechaFin?: string,
    clienteId?: number,
  ): Promise<InformesConsumo[]> {
    const query = `
      CALL gruman.\`sp-reportes-informe-consumo\`(?, ?, ?)
    `;

    const params = [
      fechaInicio ? new Date(fechaInicio) : null,
      fechaFin ? new Date(fechaFin) : null,
      clienteId || null
    ];

    return await this.informeConsumoRepository.query(query, params);
  }
}
