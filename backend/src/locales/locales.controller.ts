import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Locales } from './locales.entity';
import { LocalesService } from './locales.service';

@Controller('locales')
export class LocalesController {
  constructor(private readonly localesService: LocalesService) {}

  @Get()
  findAll(): Promise<Locales[]> {
    return this.localesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Locales | undefined> {
    return this.localesService.findOne(id);
  }
  @Post()
  create(@Body() local: Locales): Promise<Locales> {
    console.log('local', local);
    return this.localesService.create(local);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() local: Locales): Promise<Locales> {
    return this.localesService.update(id, local);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.localesService.delete(id);
  }
}
