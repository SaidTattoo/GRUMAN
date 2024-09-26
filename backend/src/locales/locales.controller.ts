import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
    return this.localesService.create(local);
  }
}
