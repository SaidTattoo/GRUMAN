import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateSubItemDto } from './dto/create-sub-item.dto';
import { UpdateSectionDto } from './dto/update-section.dto';


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

    @Delete('sections/:sectionId/items/:itemId')
    removeItem(
        @Param('sectionId') sectionId: string,
        @Param('itemId') itemId: string
    ) {
        return this.inspectionService.removeItem(+sectionId, +itemId);
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
} 