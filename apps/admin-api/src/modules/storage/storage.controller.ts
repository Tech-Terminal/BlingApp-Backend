import { Controller, Post, Body } from '@nestjs/common';
import { StorageService, GenerateUrlDto } from '@libs/index';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) {}

    @Post('presigned-url')
    async generatePresignedUrl(@Body() dto: GenerateUrlDto) {
        const data = await this.storageService.generatePresignedUploadUrl(
            dto.fileName,
            dto.contentType
        );

        return data;
    }
}
