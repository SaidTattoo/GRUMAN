import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Res,
} from '@nestjs/common';
import { ActivoFijoLocalService } from './activo-fijo-local.service';
import { ActivoFijoLocal } from './activo-fijo-local.entity';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { ReportesService } from '../reportes/reportes.service';

@Controller('activo-fijo-local')
export class ActivoFijoLocalController {
    constructor(
        private readonly activoFijoLocalService: ActivoFijoLocalService,
        private readonly reportesService: ReportesService,
    ) { }

    @Post()
    createActivoFijoLocal(@Body() activoFijoLocal: ActivoFijoLocal) {
        return this.activoFijoLocalService.createActivoFijoLocal(activoFijoLocal);
    }

    @Get('excel')
    async generarExcel(@Res() res: Response, @Query('companyId') companyId: string) {
        try {
            const activos = await this.reportesService.getReportesActivos(companyId);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Activos Fijos');

            worksheet.columns = [
                { header: 'Código Equipo', key: 'codigo_equipo', width: 10 },
                { header: 'Local', key: 'local', width: 20 },
                { header: 'Equipo', key: 'equipo', width: 15 },
                { header: 'Tipo Equipo', key: 'tipo_equipo', width: 15 },
                { header: 'Marca', key: 'marca', width: 15 },
                { header: 'Potencia', key: 'potencia', width: 15 },
                { header: 'Refrigerante', key: 'refrigerante', width: 15 },
                { header: 'On-Off/Inverter', key: 'on_off_inverter', width: 15 },
                { header: 'Suministra', key: 'suministra', width: 15 },
                { header: 'Estado operativo (si/no)', key: 'estado_operativo', width: 15 },
                { header: 'Ultima OT', key: 'ultima_ot', width: 15 },
                { header: 'Observación', key: 'observacion', width: 15 },
                { header: 'Fecha', key: 'fecha', width: 15 },
            ];

            activos.forEach((activo) => {
                worksheet.addRow([
                    activo.codigo_equipo,
                    activo.local,
                    activo.equipo,
                    activo.tipo_equipo,
                    activo.marca,
                    activo.potencia,
                    activo.refrigerante,
                    activo.on_off_inverter,
                    activo.suministra,
                    activo.estado_operativo,
                    activo.ultima_ot,
                    activo.observacion,
                    activo.fecha,
                ]);
            });

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = {
                vertical: 'middle',
                horizontal: 'center',
            };

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=activos_fijos.xlsx',
            );

            const buffer = await workbook.xlsx.writeBuffer();

            res.send(buffer);
        } catch (error) {
            console.error('Error al generar el Excel:', error);
            res.status(500).send('Error al generar el archivo Excel');
        }
    }

    @Get()
    getAllActivoFijoLocal() {
        return this.activoFijoLocalService.getAllActivoFijoLocal();
    }

    @Get(':id')
    getActivoFijoLocal(@Param('id') id: number) {
        return this.activoFijoLocalService.getActivoFijoLocalById(id);
    }

    @Put(':id')
    updateActivoFijoLocal(
        @Param('id') id: number,
        @Body() activoFijoLocal: ActivoFijoLocal,
    ) {
        return this.activoFijoLocalService.updateActivoFijoLocal(
            id,
            activoFijoLocal,
        );
    }

    @Delete(':id')
    deleteActivoFijoLocal(@Param('id') id: number) {
        return this.activoFijoLocalService.deleteActivoFijoLocal(id);
    }
}
