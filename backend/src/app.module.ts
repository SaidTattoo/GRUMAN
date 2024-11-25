import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
/* import { LocalesModule } from './locales/locales.module';
import { SectoresTrabajoModule } from './sectores-trabajo/sectores-trabajo.module';
import { ProgramacionModule } from './programacion/programacion.module'; */
import { join } from 'path';
import { RepuestosModule } from './repuestos/repuestos.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { TipoActivoModule } from './tipo_activo/tipo_activo.module';
import { RegionesComunasModule } from './regiones-comunas/regiones-comunas.module';
import { LocalesModule } from './locales/locales.module';
import { ProgramacionModule } from './programacion/programacion.module';
import { SectoresTrabajoModule } from './sectores-trabajo/sectores-trabajo.module';
import { SectoresTrabajoDefaultModule } from './sectores-trabajo-default/sectores-trabajo-default.module';
import { TipoServicioModule } from './tipo-servicio/tipo-servicio.module';
import { TipoDocumentoModule } from './tipo-documento/tipo-documento.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ServiciosModule } from './servicios/servicios.module';
import { SolicitudesAprobacionCorrectivaModule } from './solicitudes-aprobacion-correctiva/solicitudes-aprobacion-correctiva.module';
import { ServiciosRealizadosModule } from './servicios_realizados/servicios_realizados.module';
@Module({
  imports: [
    DatabaseModule, 
    UsersModule, 
    AuthModule, 
    TipoActivoModule,
    RegionesComunasModule,
    ClientModule,
    ServiciosModule,
    UploadModule,
    RepuestosModule,
    VehiculosModule,
    LocalesModule,
    TipoDocumentoModule,
    DocumentosModule,
    ProgramacionModule,
    SectoresTrabajoModule,
    SectoresTrabajoDefaultModule,
    TipoServicioModule,
    SolicitudesAprobacionCorrectivaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Asegúrate de que esta ruta es correcta
      serveRoot: '/uploads', // Esto asegura que las rutas comiencen con /uploads
    }),
    ServiciosRealizadosModule,
/*     LocalesModule,
    SectoresTrabajoModule,
    ProgramacionModule */
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
