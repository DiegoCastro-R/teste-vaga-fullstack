import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MinioService } from '@/services/minio/minio.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UploadController],
  providers: [UploadService, MinioService, ConfigService],
})
export class UploadModule {}
