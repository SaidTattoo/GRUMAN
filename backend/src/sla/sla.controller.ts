import { Controller, Post, Body, Get, Param, Delete, Put } from '@nestjs/common';
import { SlaService } from './sla.service';
import { SlaDto } from './dto/sla.dto';

@Controller('sla')
export class SlaController {
    constructor(private readonly slaService: SlaService) {}

    @Post()
    create(@Body() createSlaDto: SlaDto) {
        return this.slaService.create(createSlaDto);
    }

    @Get()
    findAll() {
        return this.slaService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.slaService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.slaService.remove(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateSlaDto: SlaDto) {
        return this.slaService.update(+id, updateSlaDto);
    }
}
