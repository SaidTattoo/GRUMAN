import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TecnicosController } from './tecnicos.controller';
import { TecnicosService } from './tecnicos.service';
import { User } from './tecnico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [TecnicosService],
  controllers: [TecnicosController],
  exports: [TecnicosService],
})
export class TecnicosModule {}
