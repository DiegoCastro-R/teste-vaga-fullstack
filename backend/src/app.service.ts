import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.start();
  }

  start(): void {
    const port = this.configService.get<number>('PORT', 3000);
    const host = this.configService.get<string>('host', 'http://localhost');
    this.logger.log(`🚀 App is up and running on Port: ${host + ':' + port}`);
  }

  appHealth(): string {
    return `🏃‍♂️ App is healthy, At: ${new Date().toLocaleString()}`;
  }
}
