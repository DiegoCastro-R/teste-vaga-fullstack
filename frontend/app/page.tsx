"use client";
import React, { useState } from 'react';
import { create } from 'zustand';
import axios from 'axios';
import { Table, Button } from '@radix-ui/themes';
import { FaFileExcel } from 'react-icons/fa';

interface FileData {
  id: number;
  file: string;
  nrInst: string;
  nrAgencia: string;
  cdClient: string;
  nmClient: string;
  nrCpfCnpj: string;
  nrContrato: string;
  dtContrato: string;
  qtPrestacoes: number;
  vlTotal: number;
  vlTotalInBRL: string;
  cdProduto: string;
  dsProduto: string;
  cdCarteira: string;
  dsCarteira: string;
  nrProposta: string;
  nrPresta: string;
  tpPresta: string;
  nrSeqPre: string;
  dtVctPre: string;
  vlPresta: number;
  vlPrestaInBrl: string;
  vlMora: number;
  vlMoraInBrl: string;
  vlMulta: number;
  vlMultaInBrl: string;
  vlOutAcr: number;
  vlOutAcrInBrl: string;
  vlIof: string;
  vlIofInBrl: string;
  vlDescon: number;
  vlDesconInBrl: string;
  vlAtual: number;
  vlAtualInBRL: string;
  idSituac: string;
  idSitVen: string;
  vlTotalInt: number;
  vlPrestaInt: number;
  vlMoraInt: number;
  vlPrestaMora: number;
  calculatedPresta: number;
  calculatedPrestaMora: number;
  vlMovimento: number;
  isPrestaValid: boolean;
  isPrestaMoraValid: boolean;
  isMovimentoValid: boolean;
  isCpfCnpjValid: boolean;
  isValid: boolean;
}

interface UploadedFile {
  fileName: string;
  data: FileData[] | null;
  processed: boolean;
}

interface FileStore {
  uploadedFiles: UploadedFile[];
  selectedFiles: string[];
  addUploadedFile: (fileData: UploadedFile) => void;
  toggleSelectedFile: (fileName: string) => void;
}

const useFileStore = create<FileStore>((set) => ({
  uploadedFiles: [],
  selectedFiles: [],
  addUploadedFile: (fileData) =>
    set((state) => ({
      uploadedFiles: [...state.uploadedFiles, { ...fileData, processed: false }],
    })),
  toggleSelectedFile: (fileName) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(fileName)
        ? state.selectedFiles.filter((name) => name !== fileName)
        : [...state.selectedFiles, fileName],
    })),
}));

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [fileData, setFileData] = useState<FileData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { uploadedFiles, selectedFiles, addUploadedFile, toggleSelectedFile } = useFileStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Por favor, selecione um arquivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3005/upload', formData);

      if (response.data.data.file) {
        const data = response.data.data;
        setMessage(data.message);
        addUploadedFile({ fileName: data.file, data: null, processed: false });
      } else {
        setMessage('Falha ao carregar o arquivo.');
      }
    } catch (error) {
      setMessage('Erro ao enviar o arquivo.');
      console.error('Erro ao enviar o arquivo:', error);
    }
  };

  const fetchFileData = async (fileName: string, page: number, pageSize: number, delayMs = 30000) => {
    try {
      const file = uploadedFiles.find((file) => file.fileName === fileName);

      if (file && !file.processed) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const response = await axios.get(`http://localhost:3005/data-processor/get-data`, {
        params: {
          fileName,
          page,
          pageSize,
        },
      });

      if (response.status === 200 && response.data.data.fileData.length > 0) {
        const fileData = response.data.data.fileData;
        setFileData(fileData);

        // Atualiza o estado dos arquivos processados
        const updatedFiles = uploadedFiles.map((file) => {
          if (file.fileName === fileName) {
            return {
              ...file,
              data: fileData,
              processed: true,
            };
          }
          return file;
        });

        useFileStore.setState({ uploadedFiles: updatedFiles });
      } else {
        setMessage(`Nenhum dado encontrado para ${fileName}.`);
        setFileData([]);
      }
    } catch (error) {
      setMessage(`Erro ao buscar dados para ${fileName}: ${error}`);
      console.error(`Erro ao buscar dados para ${fileName}:`, error);
      setFileData([]);
    }
  };

  const handleToggleSelect = async (fileName: string) => {
    toggleSelectedFile(fileName);
    await fetchFileData(fileName, currentPage, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    selectedFiles.forEach(async (fileName) => {
      await fetchFileData(fileName, newPage, pageSize);
    });
  };

  const renderValidationStatus = (isValid: boolean): JSX.Element => {
    if (isValid) {
      return <span className="text-green-500">Válido</span>;
    } else {
      return <span className="text-red-500">Inválido</span>;
    }
  };

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-center items-center space-x-4 mb-8">
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 text-gray-700 focus:outline-none"
          accept=".csv, application/vnd.ms-excel, text/csv"
          aria-label="Upload CSV File"
        />
        <Button onClick={handleUpload} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          Enviar arquivo
        </Button>
        {message && <p className="text-red-500">{message}</p>}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-2">Arquivos</h2>
        <div className="overflow-x-auto">
          <Table.Root className="table-auto w-full">
            <Table.Header>
              <Table.Row className="bg-gray-100">
                <Table.Cell className="border border-gray-300 px-4 py-2">Arquivo</Table.Cell>
                <Table.Cell className="border border-gray-300 px-4 py-2">Ação</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {uploadedFiles.map((file) => (
                <Table.Row key={file.fileName} className="hover:bg-gray-50">
                  <Table.Cell className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center">
                      <FaFileExcel className="text-green-500 mr-2" />
                      {file.fileName}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">
                    <Button
                      onClick={() => handleToggleSelect(file.fileName)}
                      className={`flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 ${selectedFiles.includes(file.fileName) ? 'bg-red-500 hover:bg-red-600' : ''
                        }`}
                    >
                      <FaFileExcel className="text-lg text-white mr-2" />
                      {selectedFiles.includes(file.fileName) ? 'Desselecionar' : 'Selecionar'}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </div>

      {fileData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Dados do Arquivo</h2>
          <div className="overflow-x-auto">
            <Table.Root className="table-auto w-full">
              <Table.Header>
                <Table.Row className="bg-gray-100">
                  <Table.Cell className="border border-gray-300 px-4 py-2">Número do Contrato</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">Cliente</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">Valor Total (BRL)</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">Valor Prestaçao (BRL)</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">Total Prestacoes</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">Prestacao Calculada</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">Prestações Validas</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">Movimento Valido</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">CPF/CNPJ Valido</Table.Cell>
                  <Table.Cell className="border border-gray-300 px-4 py-2">Validação Geral</Table.Cell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {fileData.map((data) => (
                  <Table.Row key={data.id} className="hover:bg-gray-50">

                    <Table.Cell className="border border-gray-300 px-4 py-2">{data.nrContrato}</Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">{data.nmClient}</Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">{data.vlTotalInBRL}</Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">{data.vlPrestaInBrl}</Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">{data.qtPrestacoes}</Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      data.vlAtual,
                    )}</Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">
                      {renderValidationStatus(data.isPrestaValid)}
                    </Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">
                      {renderValidationStatus(data.isMovimentoValid)}
                    </Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">
                      {renderValidationStatus(data.isCpfCnpjValid)}
                    </Table.Cell>
                    <Table.Cell className="border border-gray-300 px-4 py-2">
                      {renderValidationStatus(data.isValid)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
        </div>
      )}

      {fileData.length > 0 && (
        <div className="flex justify-center items-center">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-500 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Anterior
          </Button>
          <text className="px-4 text-gray-800">{currentPage}</text>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={fileData.length < pageSize}
            className="bg-green-500 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Próxima
          </Button>
        </div>
      )}
    </main>
  );
};

export default Home;
