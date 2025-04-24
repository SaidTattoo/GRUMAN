import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Res,
} from '@nestjs/common';
import { ActivoFijoLocalService } from './activo-fijo-local.service';
import { ActivoFijoLocal } from './activo-fijo-local.entity';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Controller('activo-fijo-local')
export class ActivoFijoLocalController {
    constructor(
        private readonly activoFijoLocalService: ActivoFijoLocalService,
    ) { }

    @Post()
    createActivoFijoLocal(@Body() activoFijoLocal: ActivoFijoLocal) {
        return this.activoFijoLocalService.createActivoFijoLocal(activoFijoLocal);
    }

    @Get('excel')
    async generarExcel(@Res() res: Response) {
        try {
            const activos = await this.activoFijoLocalService.getAllActivoFijoLocal();

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Activos Fijos');

            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Tipo Equipo', key: 'tipo_equipo', width: 20 },
                { header: 'Marca', key: 'marca', width: 15 },
                { header: 'Potencia', key: 'potencia_equipo', width: 15 },
                { header: 'Refrigerante', key: 'refrigerante', width: 15 },
                { header: 'Tipo', key: 'on_off_inverter', width: 15 },
                { header: 'Suministra', key: 'suministra', width: 15 },
                { header: 'Código', key: 'codigo_activo', width: 15 },
            ];

            activos.forEach((activo) => {
                worksheet.addRow({
                    id: activo.id,
                    tipo_equipo: activo.tipo_equipo,
                    marca: activo.marca,
                    potencia_equipo: activo.potencia_equipo,
                    refrigerante: activo.refrigerante,
                    on_off_inverter: activo.on_off_inverter,
                    suministra: activo.suministra,
                    codigo_activo: activo.codigo_activo,
                });
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
