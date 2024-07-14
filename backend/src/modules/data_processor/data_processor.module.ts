import { Module } from '@nestjs/common';
import { DataProcessorController } from './data_processor.controller';
import { DataProcessorService } from './data_processor.service';
import { MinioModule } from '@/services/minio/minio.module';
import { PrismaModule } from '@/services/prisma/prisma.module';

@Module({
  imports: [MinioModule, PrismaModule],
  controllers: [DataProcessorController],
  providers: [DataProcessorService],
})
export class DataProcessorModule {}
