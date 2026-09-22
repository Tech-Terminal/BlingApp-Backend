import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { AppConfig } from '../../config/app.config';

@Injectable()
export class StorageService {
    private readonly s3Client: S3Client;
    private readonly logger = new Logger(StorageService.name);

    constructor() {
        this.s3Client = new S3Client({
            region: AppConfig.AWS_REGION,
            endpoint: AppConfig.AWS_ENDPOINT,
            credentials: {
                accessKeyId: AppConfig.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: AppConfig.AWS_SECRET_ACCESS_KEY || '',
            },
            forcePathStyle: true,
        });
    }

    /**
     * Generate a presigned URL for uploading a file to a temporary directory.
     * @param fileName Original file name
     * @param contentType MIME type of the file
     * @param expiration Expiration time in seconds (default 15 minutes)
     */
    async generatePresignedUploadUrl(fileName: string, contentType: string, expiration = 900) {
        const extension = fileName.split('.').pop();
        const uuid = uuidv4();
        const path = `tmp/${uuid}.${extension}`;

        this.logger.log(`S3 Config Debug: Region=${AppConfig.AWS_REGION}, Endpoint=${AppConfig.AWS_ENDPOINT}, Bucket=${AppConfig.AWS_BUCKET_NAME}, AccessKey=${AppConfig.AWS_ACCESS_KEY_ID ? 'SET' : 'UNSET'}, SecretKey=${AppConfig.AWS_SECRET_ACCESS_KEY ? 'SET' : 'UNSET'}`);

        const command = new PutObjectCommand({
            Bucket: AppConfig.AWS_BUCKET_NAME,
            Key: path,
            ContentType: contentType,
            ACL: 'public-read', // Assuming files will be publicly accessible
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn: expiration });
        const expectedPublicUrl = `${AppConfig.AWS_ENDPOINT}/${AppConfig.AWS_BUCKET_NAME}/${path}`;

        return {
            url,
            path,
            extension,
            originalName: fileName,
            expectedPublicUrl,
        };
    }

    /**
     * Move a file from one path to another.
     */
    async moveFile(sourcePath: string, targetDirectory: string): Promise<string | null> {
        try {
            const fileName = sourcePath.split('/').pop();
            const targetPath = `${targetDirectory}/${fileName}`;

            await this.s3Client.send(new CopyObjectCommand({
                Bucket: AppConfig.AWS_BUCKET_NAME,
                CopySource: `${AppConfig.AWS_BUCKET_NAME}/${sourcePath}`,
                Key: targetPath,
                ACL: 'public-read',
            }));

            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: AppConfig.AWS_BUCKET_NAME,
                Key: sourcePath,
            }));

            return targetPath;
        } catch (error: any) {
            this.logger.error(`Failed to move file from ${sourcePath} to ${targetDirectory}: ${error.message}`);
            return null;
        }
    }
}
