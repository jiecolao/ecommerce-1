import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class BlobService {
  async uploadPlaceholderAsset(path: string, payload: string, contentType = 'text/plain') {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
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
