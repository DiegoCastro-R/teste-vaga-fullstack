import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataProcessorModule } from './modules/data_processor/data_processor.module';
import { UploadModule } from './modules/upload/upload.module';
import { MinioService } from './services/minio/minio.service';
import { MinioModule } from '@/services/minio/minio.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './services/rabbitmq/rabbitmq.service';
import config from '@/config/configurations';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from './services/prisma/prisma.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    HttpModule,
    DataProcessorModule,
    UploadModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService, MinioService, RabbitMQService, PrismaService],
})
export class AppModule {}
