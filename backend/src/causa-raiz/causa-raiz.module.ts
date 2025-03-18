import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CausaRaizController } from './causa-raiz.controller';
import { CausaRaizService } from './causa-raiz.service';
import { CausaRaiz } from './causa-raiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CausaRaiz])],
  controllers: [CausaRaizController],
  providers: [CausaRaizService],
  exports: [CausaRaizService]
})
export class CausaRaizModule {}
