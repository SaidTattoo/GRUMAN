import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalesController } from './locales.controller';
import { Locales } from './locales.entity';
import { LocalesService } from './locales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Locales])],
  providers: [LocalesService],
  controllers: [LocalesController],
  exports: [LocalesService],
})
export class LocalesModule {}
