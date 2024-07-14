import { Test, TestingModule } from '@nestjs/testing';
import { DataProcessorService } from './data_processor.service';

describe('DataProcessorService', () => {
  let service: DataProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataProcessorService],
    }).compile();

    service = module.get<DataProcessorService>(DataProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
