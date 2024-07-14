import { Test, TestingModule } from '@nestjs/testing';
import { DataProcessorController } from './data_processor.controller';
import { DataProcessorService } from './data_processor.service';

describe('DataProcessorController', () => {
  let controller: DataProcessorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataProcessorController],
      providers: [DataProcessorService],
    }).compile();

    controller = module.get<DataProcessorController>(DataProcessorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
