import { Controller, Post, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from './firebase.service';
import { ApiTags, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Firebase Storage')
@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'path',
    required: false,
    type: String,
    description: 'Ruta completa donde se guardará el archivo (ejemplo: "ot/123/documentos")',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('path') path?: string,
  ): Promise<{ url: string; path: string }> {
    const downloadURL = await this.firebaseService.uploadImage(file, path);
    return { 
      url: downloadURL,
      path: path || `images/${new Date().getTime()}-${file.originalname}`
    };
  }
} 