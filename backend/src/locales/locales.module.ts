import { Module } from '@nestjs/common';
import { LocalesService } from './locales.service';
import { LocalesController } from './locales.controller';
import { Locales } from './locales.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Locales])],
  providers: [LocalesService],
  controllers: [LocalesController],
  exports: [LocalesService]
})
export class LocalesModule {}
