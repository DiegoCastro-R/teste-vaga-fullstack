import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DataProcessorService } from './data_processor.service';

@Controller('data-processor')
export class DataProcessorController {
  private readonly logger = new Logger(DataProcessorController.name);
  constructor(private readonly dataProcessorService: DataProcessorService) {}

  @Post('process-and-download')
  async processAndDownloadFile(@Body() data: any) {
    data = JSON.parse(data.message);
    this.logger.log({ data });
    try {
      return this.dataProcessorService.processAndDownloadFile(data);
    } catch (error) {
      return {
        error: 'Failed to process and download file',
        details: error.message,
      };
    }
  }
  @Get('get-data')
  async getDataResult(
    @Query('fileName') fileName: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
  ) {
    try {
      const result = await this.dataProcessorService.getData(
        fileName,
        page,
        pageSize,
      );
      return { data: result };
    } catch (error) {
      throw new Error('Failed to fetch data');
    }
  }
}
