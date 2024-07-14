import { PartialType } from '@nestjs/mapped-types';
import { CreateDataProcessorDto } from './create-data_processor.dto';

export class UpdateDataProcessorDto extends PartialType(CreateDataProcessorDto) {}
