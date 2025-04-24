import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportesActivos } from './entities/reportes-activos.entity';
import { ActivoFijoLocal } from '../activo-fijo-local/activo-fijo-local.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(ReportesActivos)
    private readonly reportesRepository: Repository<ReportesActivos>,
    @InjectRepository(ActivoFijoLocal)
    private readonly activoFijoLocalRepository: Repository<ActivoFijoLocal>,
  ) { }

  async getReportesActivos(): Promise<ReportesActivos[]> {
    const query = `
      SELECT
        afl.codigo_activo as codigo_equipo,
        l.id as local,
        ta.name as equipo,
        afl.tipo_equipo,
        afl.marca,
        afl.potencia_equipo as potencia,
        afl.refrigerante,
        afl.on_off_inverter,
        afl.suministra,
        CASE WHEN sv.estado = 1 THEN 'Si' ELSE 'No' END as estado_operativo,
        sv.id as ultima_ot,
        sv.observaciones as observacion,
        sv.fechaVisita as fecha
      FROM activo_fijo_local afl
      LEFT JOIN locales l ON afl.localesId = l.id
      LEFT JOIN tipo_activo ta ON afl.tipoActivoId = ta.id
      LEFT JOIN (
        SELECT sv.*, cc.solicitudId, afl2.codigo_activo
        FROM solicitar_visita sv
        LEFT JOIN checklist_clima cc ON cc.solicitudId = sv.id
        LEFT JOIN activo_fijo_local afl2 ON afl2.id = cc.activoFijoId
        WHERE cc.solicitudId IS NOT NULL
        AND sv.id = (
          SELECT sv2.id
          FROM solicitar_visita sv2
          LEFT JOIN checklist_clima cc2 ON cc2.solicitudId = sv2.id
          LEFT JOIN activo_fijo_local afl3 ON afl3.id = cc2.activoFijoId
          WHERE cc2.solicitudId IS NOT NULL
          AND afl3.codigo_activo = afl2.codigo_activo
          ORDER BY sv2.fechaVisita DESC
          LIMIT 1
        )
      ) sv ON sv.codigo_activo = afl.codigo_activo
      LEFT JOIN checklist_clima cc ON cc.solicitudId = sv.id
      GROUP BY afl.codigo_activo
      ORDER BY sv.fechaVisita DESC;
    `;

    return await this.reportesRepository.query(query);
  }
}
