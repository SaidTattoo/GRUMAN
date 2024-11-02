import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentos } from './documentos.entity';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { TipoDocumento } from '../tipo-documento/tipo-documento.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Documentos, TipoDocumento])],
    providers: [DocumentosService],
    controllers: [DocumentosController],
})
export class DocumentosModule {}
