import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Vehiculo } from '../vehiculos/vehiculos.entity';
import { FirebaseModule } from '../firebase/firebase.module';
import * as multer from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    TypeOrmModule.forFeature([Vehiculo]),
    FirebaseModule
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {} 