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
    private readonly facturacionRepository: Repository<Facturacion>,
  ) {}

  async getHeader(clientId?: number, mesFacturacion?: number): Promise<any> {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
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
    if (mesFacturacion % 2 === 0) {
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

    console.log("HEADER");
    console.log(queryMonthlyCost);
    console.log("================================================");

    const monthlyCost =
      await this.informeConsumoRepository.query(queryMonthlyCost);
    const accumulatedCost =
      await this.informeConsumoRepository.query(queryAccumulatedCost);

    return {
      name: 'Valor servicios',
      type_service: 'HEADER',
      currency: 'UF',
      monthly_cost: monthlyCost[0].monthlyCost,
      accumulated_cost: accumulatedCost[0].accumulated_cost,
      percentage_cost_diff: Number(
        (
          (accumulatedCost[0].accumulated_cost * 100) /
          monthlyCost[0].monthlyCost
        ).toFixed(2),
      ),
    };
  }

  async getServices(clientId?: number, mesFacturacion?: number): Promise<any> {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
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

    let queryServices = `
      SELECT tp.nombre AS tipo_servicio,
        SUM(ir.cantidad *
        (SELECT precio_venta
        FROM cliente_repuesto
        WHERE repuesto_id = r.id
        AND cliente_id = sv.clientId
        LIMIT 1)) AS valor_cliente
      FROM item_repuestos ir
        JOIN solicitar_visita sv ON sv.id = ir.solicitarVisitaId
        JOIN tipo_servicio tp ON tp.id = sv.tipoServicioId
        JOIN locales l ON l.id = sv.localId
        JOIN repuestos r ON r.id = ir.repuestoId
        JOIN client c ON c.id = sv.clientId
      WHERE sv.tipoServicioId !='1'
        AND sv.STATUS ='validada'
        AND sv.facturacion_id='${idFacturacion}'
        AND sv.clientId ='${clientId}'
        AND r.id NOT IN('130','99','98','217','218','219')
      GROUP BY 1
    `;

    console.log("SERVICIOS");
    console.log(queryServices);
    console.log("================================================");

    const services = await this.informeConsumoRepository.query(queryServices);
    return services.map((service) => ({
      name: service.tipo_servicio,
      type_service: 'SERVICES',
      currency: 'CLP',
      monthly_cost: service.valor_cliente,
      accumulated_cost: 0,
      percentage_cost_diff: 0,
    }));
  }

  async getReactivosRM(
    clientId?: number,
    mesFacturacion?: number,
  ): Promise<any> {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
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
    // SERVICE | REPLACEMENT | REACTIVES_RM | REACTIVES_REGION| HEADER | TOTAL |
    let queryServices = `
        SELECT
        tp.nombre AS tipo_servicio,
        SUM(ir.cantidad * (SELECT precio_venta FROM cliente_repuesto WHERE repuesto_id = r.id AND cliente_id = sv.clientId LIMIT 1)) AS valor_cliente
        FROM
        item_repuestos ir
        JOIN
        solicitar_visita sv ON sv.id = ir.solicitarVisitaId
        JOIN
        tipo_servicio tp ON tp.id = sv.tipoServicioId
        JOIN
        locales l ON l.id = sv.localId
        JOIN
        repuestos r ON r.id = ir.repuestoId
        JOIN
        client c ON c.id = sv.clientId
        WHERE
        sv.tipoServicioId ='1'
        AND sv.STATUS ='validada'
        AND sv.facturacion_id='${idFacturacion}'
        AND sv.clientId ='${clientId}'
        AND l.regionId IN ('6','7','8')
        AND r.id NOT IN('130','99','98','217','218','219')
        GROUP BY 1
    `;

    console.log("REACTIVOS RM");
    console.log(queryServices);
    console.log("================================================");

    const reactiveRM = await this.informeConsumoRepository.query(queryServices);
    return {
      name: reactiveRM[0]?.tipo_servicio || 'Reactivos RM',
      type_service: 'REACTIVES_RM',
      currency: 'CLP',
      monthly_cost: reactiveRM[0]?.valor_cliente || 0,
      accumulated_cost: 0,
      percentage_cost_diff: 0,
    };
  }

  async getReactivosRegion(
    clientId?: number,
    mesFacturacion?: number,
  ): Promise<any> {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
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
    // SERVICE | REPLACEMENT | REACTIVES_RM | REACTIVES_REGION| HEADER | TOTAL |
    let queryRegions = `
      SELECT
      tp.nombre AS tipo_servicio,
      SUM(ir.cantidad * (SELECT precio_venta FROM cliente_repuesto WHERE repuesto_id = r.id AND cliente_id = sv.clientId LIMIT 1)) AS valor_cliente
      FROM
      item_repuestos ir
      JOIN
      solicitar_visita sv ON sv.id = ir.solicitarVisitaId
      JOIN
      tipo_servicio tp ON tp.id = sv.tipoServicioId
      JOIN
      locales l ON l.id = sv.localId
      JOIN
      repuestos r ON r.id = ir.repuestoId
      JOIN
      client c ON c.id = sv.clientId
      WHERE
      sv.tipoServicioId ='1'
      AND sv.STATUS ='validada'
      AND sv.facturacion_id='${idFacturacion}'
      AND sv.clientId ='${clientId}'
      AND l.regionId IN ('3','10','11')
      AND r.id NOT IN('130','99','98','217','218','219')
      GROUP BY 1
    `;

    console.log("REACTIVOS REGION");
    console.log(queryRegions);
    console.log("================================================");

    const reactiveRegions = await this.informeConsumoRepository.query(
      queryRegions,
    );
    return {
      name: reactiveRegions[0]?.tipo_servicio || 'Reactivos Region',
      type_service: 'REACTIVES_REGION',
      currency: 'CLP',
      monthly_cost: reactiveRegions[0]?.valor_cliente || 0,
      accumulated_cost: 0,
      percentage_cost_diff: 0,
    };
  }
  
  async getLuminaries(
    clientId?: number,
    mesFacturacion?: number,
  ): Promise<any> {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
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
    // SERVICE | REPLACEMENT | REACTIVES_RM | REACTIVES_REGION| HEADER | TOTAL |
    let queryLuminaries = `
      SELECT
      tp.nombre AS tipo_servicio,
      SUM(ir.cantidad * (SELECT precio_venta FROM cliente_repuesto WHERE repuesto_id = r.id AND cliente_id = sv.clientId LIMIT 1)) AS valor_cliente
      FROM
      item_repuestos ir
      JOIN
      solicitar_visita sv ON sv.id = ir.solicitarVisitaId
      JOIN
      tipo_servicio tp ON tp.id = sv.tipoServicioId
      JOIN
      locales l ON l.id = sv.localId
      JOIN
      repuestos r ON r.id = ir.repuestoId
      JOIN
      client c ON c.id = sv.clientId
      WHERE
      sv.STATUS ='validada'
      AND sv.facturacion_id='${idFacturacion}'
      AND sv.clientId ='${clientId}'
      AND r.id IN('130','99','98','217','218','219')
      GROUP BY 1
    `;
    console.log("LUMINARIAS");
    console.log(queryLuminaries);
    console.log("================================================");

    const services = await this.informeConsumoRepository.query(queryLuminaries);
    return services.map((service) => ({
      name: service.tipo_servicio,
      type_service: 'LUMINARIES', 
      currency: 'CLP',
      monthly_cost: service.valor_cliente,
      accumulated_cost: 0,
      percentage_cost_diff: 0,
    }));
  }
}
