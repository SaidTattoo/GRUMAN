import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { existsSync, mkdirSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path = req.params.path;
          const uploadPath = join(__dirname, '..', 'uploads', path);

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @Post('upload/:path')
  uploadFile(@UploadedFile() file: Express.Multer.File, @Param('path') path: string) {
    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    const filename = file.filename;
    const fileUrl = `${process.env.API_URL}uploads/${path}/${filename}`;
    console.log('#############################');
    console.log('#############################');
    console.log(process.env.API_URL);
    console.log(fileUrl);
    console.log('#############################');
    console.log('#############################');
    return {
      filename: filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      url: fileUrl,
    };
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const solicitudId = req.params.solicitudId;
          const itemId = req.params.itemId;
          const uploadPath = join(__dirname, '..', 'uploads', 'solicitudes', solicitudId, itemId);

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @Post('upload/solicitudes/:solicitudId/:itemId')
  uploadSolicitudFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('solicitudId') solicitudId: string,
    @Param('itemId') itemId: string
  ) {
    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    const filename = file.filename;
    const fileUrl = `${process.env.API_URL}uploads/solicitudes/${solicitudId}/${itemId}/${filename}`;

    return {
      filename: filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      url: fileUrl,
    };
  }
}
