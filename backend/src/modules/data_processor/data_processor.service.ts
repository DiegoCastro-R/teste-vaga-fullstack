import { Injectable } from '@nestjs/common';
import { MinioService } from '@/services/minio/minio.service';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { CSVRow } from './dto/csv-row-data_processor.dto';
import {
  parseToCents,
  parseToDateISO,
  parseValueToBRL,
  validateData,
} from '@/utils/utils';
import { PrismaService } from '@/services/prisma/prisma.service';

@Injectable()
export class DataProcessorService {
  constructor(
    private readonly minioService: MinioService,
    private prisma: PrismaService,
  ) {}

  async processAndDownloadFile(message: any): Promise<any> {
    const { bucketName, fileName } = message;
    const downloadPath = './temp';

    try {
      const filePath = await this.minioService.downloadFile(
        bucketName,
        fileName,
        downloadPath,
      );
      const parsedData = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (csvRow: CSVRow) => {
          const parsedRow = {
            file: fileName,
            nrInst: csvRow.nrInst,
            nrAgencia: csvRow.nrAgencia,
            cdClient: csvRow.cdClient,
            nmClient: csvRow.nmClient,
            nrCpfCnpj: csvRow.nrCpfCnpj,
            nrContrato: csvRow.nrContrato,
            dtContrato: parseToDateISO(csvRow.dtContrato),
            qtPrestacoes: csvRow.qtPrestacoes,
            vlTotal: parseToCents(Number(csvRow.vlTotal)),
            vlTotalInBRL: parseValueToBRL(Number(csvRow.vlTotal)),
            cdProduto: csvRow.cdProduto,
            dsProduto: csvRow.dsProduto,
            cdCarteira: csvRow.cdCarteira,
            dsCarteira: csvRow.dsCarteira,
            nrProposta: csvRow.nrProposta,
            nrPresta: csvRow.nrPresta,
            tpPresta: csvRow.tpPresta,
            nrSeqPre: csvRow.nrSeqPre,
            dtVctPre: parseToDateISO(csvRow.dtVctPre),
            vlPresta: parseToCents(Number(csvRow.vlPresta)),
            vlPrestaInBrl: parseValueToBRL(Number(csvRow.vlPresta)),
            vlMora: parseToCents(Number(csvRow.vlMora)),
            vlMoraInBrl: parseValueToBRL(Number(csvRow.vlMora)),
            vlMulta: parseToCents(Number(csvRow.vlMulta)),
            vlMultaInBrl: parseValueToBRL(Number(csvRow.vlMulta)),
            vlOutAcr: parseToCents(Number(csvRow.vlOutAcr)),
            vlOutAcrInBrl: parseValueToBRL(Number(csvRow.vlOutAcr)),
            vlIof: parseValueToBRL(Number(csvRow.vlIof)),
            vlIofInBrl: parseValueToBRL(Number(csvRow.vlIof)),
            vlDescon: parseToCents(Number(csvRow.vlDescon)),
            vlDesconInBrl: parseValueToBRL(Number(csvRow.vlDescon)),
            vlAtual: parseToCents(Number(csvRow.vlAtual)),
            vlAtualInBrl: parseValueToBRL(Number(csvRow.vlAtual)),
            idSituac: csvRow.idSituac,
            idSitVen: csvRow.idSitVen,
          };
          const validatedRow = validateData(parsedRow);
          console.log({ validatedRow });

          parsedData.push(validatedRow);
        })
        .on('end', async () => {
          await this.prisma.contract.createMany({ data: parsedData });
          console.log('CSV file successfully processed');
        });

      return parsedData;
    } catch (error) {
      throw new Error(`Failed to process and download file: ${error.message}`);
    }
  }

  async getData(fileName: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const data = await this.prisma.contract.findMany({
      where: { file: fileName },
      skip,
      take,
    });

    const totalRecords = await this.prisma.contract.count({
      where: { file: fileName },
    });

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      fileData: data,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
      },
    };
  }
}
