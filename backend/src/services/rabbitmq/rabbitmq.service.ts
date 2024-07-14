import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly queue: string;
  private readonly connectionUrl: string;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly deadFileProcessQueue: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.queue = this.configService.get<string>('QUEUE_NAME');
    this.connectionUrl = this.configService.get<string>('RABBITMQ_URL');
    this.retryAttempts = this.configService.get<number>('RETRY_ATTEMPTS', 5);
    this.retryDelay = this.configService.get<number>('RETRY_DELAY', 1000);
    this.deadFileProcessQueue = this.configService.get<string>(
      'DEAD_FILEPROCESS_QUEUE',
      'dead_fileprocess_queue',
    );
    this.connect();
  }

  private async connect() {
    try {
      this.logger.log(`Connecting to RabbitMQ at ${this.connectionUrl}`);
      this.logger.log(`Using queue: ${this.queue}`);

      this.connection = await amqp.connect(this.connectionUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.deadFileProcessQueue, {
        durable: true,
      });

      await this.channel.assertQueue(this.queue, {
        durable: true,
        arguments: {
          'x-dead-fileprocess-exchange': { exchange: '' },
          'x-dead-fileprocess-routing-key': { key: this.deadFileProcessQueue },
        },
      });

      this.logger.log(`Connected to RabbitMQ queue ${this.queue}`);
      this.consumeMessages();
    } catch (error) {
      this.logger.error('Error connecting to RabbitMQ', error);
    }
  }

  private async consumeMessages() {
    try {
      await this.channel.consume(this.queue, async (msg) => {
        if (msg) {
          const content = msg.content.toString();
          this.logger.log(`Received message: ${content}`);

          const retries = (msg.properties.headers['x-retries'] as number) || 0;
          try {
            await this.processMessage(content);
            this.channel.ack(msg);
          } catch (error) {
            if (retries >= this.retryAttempts) {
              this.logger.error(
                `Message processing failed after ${retries} retries. Moving to dead letter queue.`,
              );
              await this.moveToDeadFileProcessQueue(msg);
            } else {
              this.logger.warn(
                `Message processing failed. Retrying (${retries + 1}/${this.retryAttempts})...`,
              );
              await this.retryMessage(msg, retries + 1);
            }
          }
        }
      });
      this.logger.log(`Started consuming messages from ${this.queue}`);
    } catch (error) {
      this.logger.error(`Error consuming messages from ${this.queue}`, error);
    }
  }

  private async processMessage(message: string) {
    try {
      const endpoint = this.configService.get<string>('PROCESSING_ENDPOINT');
      const response = await firstValueFrom(
        this.httpService.post(endpoint, { message }),
      );
      this.logger.log(`Message processed: ${response.data}`);
    } catch (error) {
      this.logger.error('Error processing message:', error);
      throw error;
    }
  }

  private async retryMessage(msg: amqp.ConsumeMessage, retries: number) {
    const delay = this.retryDelay * Math.pow(2, retries);
    setTimeout(() => {
      this.channel.nack(msg, false, false);
      this.channel.sendToQueue(this.queue, msg.content, {
        headers: { 'x-retries': retries },
      });
    }, delay);
  }

  private async moveToDeadFileProcessQueue(msg: amqp.ConsumeMessage) {
    await this.channel.sendToQueue(this.deadFileProcessQueue, msg.content);
    this.channel.ack(msg);
  }
}
