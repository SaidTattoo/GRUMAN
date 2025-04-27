import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformesConsumo } from '../entities/informes-consumo.entity';

@Injectable()
export class InformeMesFacturacionService {
  constructor(
    @InjectRepository(InformesConsumo)
    private readonly informeConsumoRepository: Repository<InformesConsumo>,
  ) {}

  async getReportesMesFacturacion(
    companyId?: number,
    mesFacturacion?: number,
  ): Promise<InformesConsumo[]> {

    const query = `
      CALL gruman.\`sp-reportes-mes-facturacion\`(?, ?)
    `;
  
    const params = [companyId, mesFacturacion];

    return await this.informeConsumoRepository.query(query, params);
  }
}
