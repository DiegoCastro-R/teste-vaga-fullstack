# Projeto de Exemplo

## Tecnologias Usadas:

<p align="center">
  <img src="https://cdn.worldvectorlogo.com/logos/next-js.svg" alt="NextJS Logo" width="100" height="100">
  <img src="https://ih1.redbubble.net/image.1084299841.8155/tst,small,507x507-pad,600x600,f8f8f8.jpg" alt="NestJS Logo" width="100" height="100">
  <img src="https://cdn.iconscout.com/icon/free/png-256/free-typescript-1174965.png" alt="Typescript Logo" width="100" height="100">
  <img src="https://media.dev.to/cdn-cgi/image/width=1080,height=1080,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fcsanba2xewj1pw2zprlh.png" alt="RabbitMQ Logo" width="100" height="100">
  <img src="https://images.peerspot.com/image/upload/c_scale,f_auto,q_auto,w_200/w9l593yvqnusnz7stqcq6fcnvf6o.png" alt="Minio Logo" width="100" height="100">
</p>

## Descrição do Projeto

Este projeto utiliza Next.js e NestJS para criar uma aplicação web full-stack. A integração entre front-end e back-end é feita utilizando TypeScript para garantir tipagem e segurança durante o desenvolvimento. RabbitMQ é utilizado para a comunicação assíncrona entre serviços, enquanto Minio é utilizado como um servidor de armazenamento de objetos para gerenciar arquivos e dados da aplicação.

## Instalação

Para instalar e executar este projeto localmente, siga os passos abaixo:

1. Clone o repositório do GitHub:

   ```bash
   git clone https://github.com/DiegoCastro-R/teste-vaga-fullstack/
   git checkout feat/diego-castro-r-implementation



2. Instale as dependências do projeto:

    ```bash
    ./install-deps.sh

3. Prepare o ambiente docker:
    ```bash
    docker-compose up -d


3. Execute a aplicação:

    ```bash
    ./app-init.sh
    
  ### O front-end estará disponível em http://localhost:3000 e o back-end em http://localhost:3001.  

Funcionalidades
Upload de Arquivos: Permite o upload de arquivos CSV que são processados pelo back-end para extrair e validar dados.

Integração Assíncrona: Utiliza RabbitMQ para processamento assíncrono de eventos entre serviços.

Armazenamento de Objetos: Utiliza Minio como um servidor de armazenamento de objetos para gerenciar arquivos grandes e dados da aplicação.

