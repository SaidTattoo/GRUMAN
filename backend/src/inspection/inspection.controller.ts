import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, InternalServerErrorException, Query } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateSubItemDto } from './dto/create-sub-item.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { AddRepuestoDto } from './dto/add-repuesto.dto';


@Controller('inspection')
export class InspectionController {
    constructor(private readonly inspectionService: InspectionService) {}

    // Secciones
    @Post('sections')
    createSection(@Body() createSectionDto: CreateSectionDto) {
        return this.inspectionService.createSection(createSectionDto);
    }

    @Get('sections')
    findAllSections() {
        return this.inspectionService.findAllSections();
    }

    @Patch('sections/:id')
    updateSection(
        @Param('id') id: string,
        @Body() updateSectionDto: UpdateSectionDto
    ) {
        return this.inspectionService.updateSection(+id, updateSectionDto);
    }

    @Delete('sections/:id')
    removeSection(@Param('id') id: string) {
        return this.inspectionService.removeSection(+id);
    }

    // Items
    @Post('sections/:sectionId/items')
    createItem(
        @Param('sectionId') sectionId: string,
        @Body() createItemDto: CreateItemDto
    ) {
        return this.inspectionService.createItem(+sectionId, createItemDto);
    }

    @Patch('sections/:sectionId/items/:itemId')
    updateItem(
        @Param('sectionId') sectionId: string,
        @Param('itemId') itemId: string,
        @Body() updateItemDto: CreateItemDto
    ) {
        return this.inspectionService.updateItem(+sectionId, +itemId, updateItemDto);
    }

    @Delete('items/:id')
    async deleteItem(@Param('id') id: string) {
        try {
            // Primero intentar eliminar como repuesto
            try {
                return await this.inspectionService.deleteRepuestoFromItem(id);
            } catch (error) {
                if (!(error instanceof NotFoundException)) {
                    throw error;
                }
                // Si no es un repuesto, intentar eliminar como item
                const item = await this.inspectionService.findItemById(+id);
                if (!item) {
                    throw new NotFoundException(`Item with ID ${id} not found`);
                }
                await this.inspectionService.removeItem(item.section.id, +id);
                return {
                    statusCode: 200,
                    message: 'Item deleted successfully'
                };
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error deleting item');
        }
    }

    // SubItems
    @Post('sections/:sectionId/items/:itemId/subitems')
    createSubItem(
        @Param('sectionId') sectionId: string,
        @Param('itemId') itemId: string,
        @Body() createSubItemDto: CreateSubItemDto
    ) {
        return this.inspectionService.createSubItem(+sectionId, +itemId, createSubItemDto);
    }

    @Patch('sections/:sectionId/items/:itemId/subitems/:subItemId')
    updateSubItem(
        @Param('sectionId') sectionId: string,
        @Param('itemId') itemId: string,
        @Param('subItemId') subItemId: string,
        @Body() updateSubItemDto: CreateSubItemDto
    ) {
        return this.inspectionService.updateSubItem(+sectionId, +itemId, +subItemId, updateSubItemDto);
    }

    @Delete('sections/:sectionId/items/:itemId/subitems/:subItemId')
    removeSubItem(
        @Param('sectionId') sectionId: string,
        @Param('itemId') itemId: string,
        @Param('subItemId') subItemId: string
    ) {
        return this.inspectionService.removeSubItem(+sectionId, +itemId, +subItemId);
    }

    @Get('sections/:sectionId/items/:itemId/repuestos')
    async getRepuestosFromItem(
        @Param('sectionId') sectionId: number,
        @Param('itemId') itemId: number,
        @Query('clienteId') clienteId?: number
    ) {
        return await this.inspectionService.getRepuestosFromItem(sectionId, itemId, clienteId);
    }

    @Post('sections/:sectionId/items/:itemId/repuestos')
    async addRepuestoToItem(
        @Param('sectionId') sectionId: number,
        @Param('itemId') itemId: number,
        @Body() addRepuestoDto: AddRepuestoDto,
        @Query('clienteId') clienteId?: number
    ) {
        return await this.inspectionService.addRepuestoToItem(sectionId, itemId, addRepuestoDto, clienteId);
    }

    @Delete('sections/:sectionId/items/:itemId/repuestos/:repuestoId')
    removeRepuestoFromItem(
        @Param('sectionId') sectionId: string,
        @Param('itemId') itemId: string,
        @Param('repuestoId') repuestoId: string
    ) {
        return this.inspectionService.removeRepuestoFromItem(
            +sectionId,
            +itemId,
            +repuestoId
        );
    }

    @Post('repuestos/bulk')
    async addMultipleRepuestos(@Body() repuestosMap: { [key: string]: any[] }) {
        return this.inspectionService.addMultipleRepuestosToSubItems(repuestosMap);
    }

    @Post('items/:itemId/repuestos')
    insertRepuestoInItem(
        @Param('itemId') itemId: string,
        @Body() addRepuestoDto: AddRepuestoDto
    ) {
        return this.inspectionService.insertRepuestoInItem(
            itemId,
            addRepuestoDto.repuestoId,
            addRepuestoDto.cantidad,
            addRepuestoDto.comentario,
            addRepuestoDto.solicitarVisitaId,
            addRepuestoDto.estado
        );
    }

    @Delete('items/:itemId')
    deleteRepuestoFromItem(
        @Param('itemId') itemId: string
    ) {
        return this.inspectionService.deleteRepuestoFromItem(itemId);
    }

    @Get('subitems/:subItemId/repuestos')
    getRepuestosBySubItem(@Param('subItemId') subItemId: string) {
        return this.inspectionService.getRepuestosBySubItem(+subItemId);
    }

    @Patch('sections/cambiar-estado-foto/:sectionId/items/:itemId/subitems/:subItemId')
    cambiarEstadoFoto(
        @Param('sectionId') sectionId: string,
        @Param('itemId') itemId: string,
        @Param('subItemId') subItemId: string,
        @Body() updateSubItemDto: CreateSubItemDto
    ) {
        return this.inspectionService.cambiarEstadoFoto(+sectionId, +itemId, +subItemId, updateSubItemDto);
    }
} 