import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeGastoAcumulado } from '../entities/informe-gasto-acumulado.entity';
import { Facturacion } from '../../facturacion/facturacion.entity';
@Injectable()
export class InformeGastoAcumuladoService {
  constructor(
    @InjectRepository(InformeGastoAcumulado)
    private readonly informeConsumoRepository: Repository<InformeGastoAcumulado>,
    @InjectRepository(Facturacion)
    private readonly facturacionRepository: Repository<Facturacion>
  ) {}

  async getHeader(
    clientId?: number,
    mesFacturacion?: number,
  ): Promise<any> {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mesTexto = meses[mesFacturacion - 1];
    const anioActual = new Date().getFullYear();
    const mesFormateado = `${mesTexto} ${anioActual}`;
    const facturacion = await this.facturacionRepository.findOne({
      where: {
        cliente: { id: clientId },
        mes: mesFormateado,
      },
    });
    const idFacturacion = facturacion.id_facturacion;

    let queryMonthlyCost = `
        SELECT 
            SUM(valorPorLocal) as monthlyCost 
        FROM locales 
        WHERE clientId ='${clientId}' 
            AND deleted ='0'
    `;
    if(mesFacturacion % 2 === 0){
      queryMonthlyCost += `
        AND regionId IN ('5', '6', '7', '8', '9', '10', '11', '13', '12', '16') -- mes par
      `;
    } else {
      queryMonthlyCost += `
        AND regionId IN ('2', '3', '4', '5', '6', '8', '9', '10', '11', '7','1') -- mes impar
      `;
    }

     let queryAccumulatedCost = `
        SELECT SUM(l.valorPorLocal) as accumulated_cost 
        FROM solicitar_visita sv
        JOIN locales l ON sv.localId = l.id
        WHERE sv.clientId ='${clientId}'
        AND sv.estado ='1'
        AND tipoServicioId='3'
        AND sv.STATUS ='validada'
        AND sv.facturacion_id='${idFacturacion}'
    `;

    console.log(queryMonthlyCost);
    console.log(queryAccumulatedCost);

    const monthlyCost = await this.informeConsumoRepository.query(queryMonthlyCost);
    const accumulatedCost = await this.informeConsumoRepository.query(queryAccumulatedCost);
    console.log(monthlyCost);
    console.log(accumulatedCost);
    return {
      name: 'Valor servicios',
      type_service: 'HEADER',
      currency: 'UF',
      monthly_cost: monthlyCost[0].monthlyCost,
      accumulated_cost: accumulatedCost[0].accumulated_cost,
      percentage_cost_diff:
        (monthlyCost[0].accumulated_cost * 100) /
        accumulatedCost[0].accumulated_cost,
    };
  }
}
