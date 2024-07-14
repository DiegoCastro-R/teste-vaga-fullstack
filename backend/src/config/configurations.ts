export default () => ({
  DATABASE_URL: `${process.env.DATABASE_URL}`,
  PORT: `${process.env.PORT || 3000}`,
  MINIO_BUCKET: `${process.env.MINIO_BUCKET}`,
  RABBITMQ_URL: `${process.env.RABBITMQ_URL}`,
  QUEUE_NAME: `${process.env.QUEUE_NAME}`,
  PROCESSING_ENDPOINT: `${process.env.PROCESSING_ENDPOINT}`,
  RETRY_ATTEMPTS: `${process.env.RETRY_ATTEMPTS}`,
  RETRY_DELAY: `${process.env.RETRY_DELAY}`,
  DEAD_FILEPROCESS_QUEUE: `${process.env.DEAD_FILEPROCESS_QUEUE}`,
});
