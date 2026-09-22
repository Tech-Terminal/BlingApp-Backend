import * as dotenv from 'dotenv';
import * as process from 'process';
import { TypeOrmModuleOptions } from "@nestjs/typeorm";


dotenv.config();

export const AppConfig = {
    // general
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV,

    // security
    JWT_SECRET: process.env.JWT_SECRET || 'super-secret-default-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // Explicitly expose all possible ports in the config registry
    ADMIN_PORT: parseInt(process.env.ADMIN_PORT || '4000', 10),
    PUBLIC_PORT: parseInt(process.env.PUBLIC_PORT || '3000', 10),

    // database
    DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
    DATABASE_NAME: process.env.DATABASE_NAME || 'bling',
    DATABASE_USER: process.env.DATABASE_USER || 'postgres',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'password',
    DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5432', 10),

    // redis
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT_NUMBER: parseInt(process.env.REDIS_PORT_NUMBER || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    // mail
    MAIL_HOST: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
    MAIL_PORT: parseInt(process.env.MAIL_PORT || '587', 10),
    MAIL_USERNAME: process.env.MAIL_USERNAME,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_ENCRYPTION: process.env.MAIL_ENCRYPTION || 'tls',
    MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS || 'support@blingapp.net',
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'Bling',

    // storage (s3 / hetzner)
    AWS_REGION: process.env.S3_REGION || 'eu-central-1',
    AWS_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY: process.env.S3_SECRET_KEY,
    AWS_BUCKET_NAME: process.env.S3_MEDIA_BUCKET_NAME,
    AWS_ENDPOINT: process.env.S3_ENDPOINT || 'https://fsn1.your-objectstorage.com',

    // search engine
    MEILISEARCH_HOST: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
    MEILISEARCH_MASTER_KEY: process.env.MEILISEARCH_MASTER_KEY,

    get typeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.DATABASE_HOST,
            port: this.DATABASE_PORT,
            username: this.DATABASE_USER,
            password: this.DATABASE_PASSWORD,
            database: this.DATABASE_NAME,
            autoLoadEntities: true,
            logging: true,
            synchronize: this.NODE_ENV !== 'production',
        };
    }
};
