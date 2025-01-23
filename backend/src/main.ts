import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpsOptions = {
    key: fs.readFileSync('../server.key'),
    cert: fs.readFileSync('../server.cert'),
  };
  
  // Configuración de CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',      // Vite dev server
      'http://localhost:8100',      // Ionic dev server
      'http://localhost:4200',      // Angular dev server
      'http://localhost',           // General localhost
      'http://138.255.103.35',     // Producción sin puerto
      'http://138.255.103.35:3000', // Backend en producción
      'http://138.255.103.35:5173', // Frontend en producción
      'capacitor://localhost',      // Capacitor local
      'ionic://localhost',          // Ionic local
      'http://localhost:8080',      // Alternativo
      '*'                          // Permitir todos los orígenes en desarrollo
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Access-Control-Allow-Origin',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('API de Usuarios')
    .setDescription('La API de gestión de usuarios')
    .setVersion('1.0')
    .addTag('usuarios')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
