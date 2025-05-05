import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
import { ActivoFijoLocalModule } from './activo-fijo-local/activo-fijo-local.module';
import { UploadV2Module } from './upload-v2/upload-v2.module';
import { SolicitarVisitaModule } from './solicitar-visita/solicitar-visita.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { InspectionModule } from './inspection/inspection.module';
import { FacturacionModule } from './facturacion/facturacion.module';
import { OrdenServicioModule } from './orden-servicio/orden-servicio.module';
import { UserVehiculoModule } from './user-vehiculo/user-vehiculo.module';
import { CausaRaizModule } from './causa-raiz/causa-raiz.module';
import { ActivoFijoRepuestosModule } from './activo-fijo-repuestos/activo-fijo-repuestos.module';
import { ChecklistClimaModule } from './checklist_clima/checklist_clima.module';
import { MailModule } from './mail/mail.module';
import { ClienteRepuestoModule } from './cliente-repuesto/cliente-repuesto.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MesesFacturacionModule } from './meses_facturacion/meses_facturacion.module';
import { ReportesModule } from './reportes/reportes.module';
import { SlaModule } from './sla/sla.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false, // Desactiva todos los logs
    }),
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
    SlaModule,
    ActivoFijoLocalModule,
    UploadV2Module,
    SolicitarVisitaModule,
    EspecialidadModule, InspectionModule, FacturacionModule, OrdenServicioModule, UserVehiculoModule, CausaRaizModule,
    ActivoFijoRepuestosModule, ChecklistClimaModule,
    MailModule,
    ClienteRepuestoModule,
    DashboardModule,
    MesesFacturacionModule,
    ReportesModule,
    SlaModule
    /*     LocalesModule,
        SectoresTrabajoModule,
        ProgramacionModule */
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
