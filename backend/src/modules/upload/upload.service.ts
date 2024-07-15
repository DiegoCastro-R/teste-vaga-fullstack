import { Injectable } from '@nestjs/common';
import { UploadedFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioService } from '@/services/minio/minio.service';
@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {}
  bucket = this.configService.get<string>('MINIO_BUCKET', 'files');

  async uploadFile(@UploadedFile() file) {
    const filename = new Date().toISOString() + '_' + file.originalname;
    try {
      const result = await this.minioService.uploadFile(
        this.bucket,
        file,
        filename,
      );
      return { message: result, data: { file: filename } };
    } catch (error) {
      return { error: error.message };
    }
  }
}
