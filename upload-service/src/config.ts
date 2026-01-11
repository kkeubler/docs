import dotenv from 'dotenv';

dotenv.config();

export const config = {
    server: {
        port: process.env.PORT || 3000,
    },
    minio: {
        endPoint: process.env.MINIO_ENDPOINT || 'minio',
        port: parseInt(process.env.MINIO_PORT || '9000'),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        bucketName: process.env.MINIO_BUCKET_NAME || 'pdfs',
    },
    db: {
        user: process.env.DB_USER || 'myuser',
        host: process.env.DB_HOST || 'db',
        database: process.env.DB_NAME || 'filedb',
        password: process.env.DB_PASSWORD || 'mypassword',
        port: parseInt(process.env.DB_PORT || '5432'),
    }
};