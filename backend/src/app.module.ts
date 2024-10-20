import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { CompaniesModule } from './companies/companies.module';
import { LocalesModule } from './locales/locales.module';
import { RepuestosModule } from './repuestos/repuestos.module';
import { TecnicosModule } from './tecnicos/tecnicos.module';
import { TipoActivoModule } from './tipo_activo/tipo_activo.module';
import { UsersModule } from './users/users.module'; // Asegúrate de que la ruta sea correcta
import { VehiculosModule } from './vehiculos/vehiculos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('TYPEORM_HOST'),
        port: configService.get<number>('TYPEORM_PORT'),
        username: configService.get<string>('TYPEORM_USERNAME'),
        password: configService.get<string>('TYPEORM_PASSWORD'),
        database: configService.get<string>('TYPEORM_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // No usar en producción
        connectTimeout: 30000, // Tiempo de espera en milisegundos
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    LocalesModule,
    VehiculosModule,
    TipoActivoModule,
    TecnicosModule,
    RepuestosModule,
    ClientesModule, // Asegúrate de que UsersModule esté importado
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Asegúrate de que esta ruta es correcta
      serveRoot: '/uploads', // Esto asegura que las rutas comiencen con /uploads
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
