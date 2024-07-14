import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as Minio from 'minio';
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { promisify } from 'util';
import * as fs from 'fs';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Minio.Client;
  private readonly logger = new Logger(MinioService.name);
  private rabbitConnection: amqp.Connection;
  private rabbitChannel: amqp.Channel;
  private readonly queue: string;
  private readonly rabbitUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'adminuser',
      secretKey: 'adminpassword',
    });

    this.queue = this.configService.get<string>('QUEUE_NAME');
    this.rabbitUrl = this.configService.get<string>('RABBITMQ_URL');
  }

  async onModuleInit() {
    await this.connectToRabbitMQ();
  }

  private async connectToRabbitMQ() {
    try {
      this.rabbitConnection = await amqp.connect(this.rabbitUrl);
      this.rabbitChannel = await this.rabbitConnection.createChannel();
      await this.rabbitChannel.assertQueue(this.queue, { durable: true });
      this.logger.log(`Connected to RabbitMQ queue ${this.queue}`);
    } catch (error) {
      this.logger.error('Error connecting to RabbitMQ', error);
    }
  }

  async uploadFile(
    bucketName: string,
    file: any,
    filename: string,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(
        bucketName,
        filename,
        file.buffer,
        file.size,
      );
      this.logger.log(`File uploaded successfully: ${filename}`);

      const message = JSON.stringify({
        eventType: 'file_uploaded',
        bucketName: bucketName,
        fileName: filename,
        timestamp: new Date().toISOString(),
      });

      this.rabbitChannel.sendToQueue(this.queue, Buffer.from(message), {
        persistent: true,
      });
      this.logger.log(
        `Message sent to RabbitMQ queue ${this.queue}: ${message}`,
      );

      return `File uploaded successfully: ${filename}`;
    } catch (error) {
      this.logger.error('Error uploading file to MinIO:', error);
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }
  }
  async downloadFile(
    bucketName: string,
    filename: string,
    destinationPath: string,
  ): Promise<string> {
    const filePath = path.join(destinationPath, filename);
    console.log(filePath);
    await this.minioClient
      .fGetObject(bucketName, filename, filePath)
      .then(() => {
        this.logger.log(`File ${filename} downloaded to ${filePath}`);
      })
      .catch((error) => {
        this.logger.error(`Error downloading file ${filename}: ${error}`);
        throw error;
      });

    return filePath;
  }

  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await promisify(fs.unlink)(filePath);
      this.logger.log(`Temporary file ${filePath} deleted.`);
    } catch (error) {
      this.logger.error(`Error deleting temporary file ${filePath}: ${error}`);
      throw error;
    }
  }
}
