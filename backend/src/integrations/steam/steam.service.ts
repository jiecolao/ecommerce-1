// backend/src/integrations/steam/steam.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SteamService {
  private readonly logger = new Logger(SteamService.name);

  constructor(private readonly httpService: HttpService) {}

  async getGameDetails(steamAppId: string) {
    const url = `https://store.steampowered.com/api/appdetails?appids=${steamAppId}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url)) as any;
      const data = response.data;

      if (data[steamAppId] && data[steamAppId].success) {
        const gameData = data[steamAppId].data

        const clean_data = {
          id: gameData.steamAppId,
          name: gameData.name,
          desc: gameData.detailed_description,
          clean_desc: gameData.detailed_description.replace(/<[^>]*>?/gm, ''),
          type: gameData.type,
        }

        return clean_data;
      } else {
        throw new HttpException('Game not found on Steam', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        'Failed to fetch data from Steam API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGameReviews(appId: string, targetCount = 1): Promise<any[]> {
    const url = `https://store.steampowered.com/appreviews/${appId}`;
    // const url =  `https://store.steampowered.com/appreviews/${appId}?json=1&review_type=positive`;
    const allReviews: any[] = [];
    let cursor = '*'; // Initial cursor required by Steam

    while (allReviews.length < targetCount) {
      const numPerPage = Math.min(100, targetCount - allReviews.length);

      try {
        const { data } = await firstValueFrom(
          this.httpService.get(url, {
            params: {
              json: 1,
              language: 'english',
              num_per_page: numPerPage,
              cursor: cursor,
            },
          }),
        ) as any;

        const reviews = data?.reviews || [];
        if (reviews.length === 0) {
          break;
        }
        
        allReviews.push(...reviews);
        
        if (!data.cursor || data.cursor === cursor) {
          break;
        }

        cursor = data.cursor;

        // Respect rate limits (150ms delay between pages)
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch {
        this.logger.error('Failed to fetch Steam reviews.');
        break;
      }
    }

    return allReviews;
  }
}
