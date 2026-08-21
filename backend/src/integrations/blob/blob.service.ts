import { Injectable, Logger } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);

  async uploadImage(path: string, payload: Buffer, contentType = 'image/jpeg') {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      this.logger.error('BLOB_READ_WRITE_TOKEN is not defined in the environment. Falling back to placeholder URL.');
      return {
        url: `https://blob.placeholder.local/${path}`,
      };
    }

    const result = await put(path, payload, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType,
    });

    return { url: result.url };
  }
}
