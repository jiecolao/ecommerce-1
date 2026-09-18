import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class OpenCriticService {
  private readonly headers: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.headers = {
      'X-RapidAPI-Key': this.configService.get<string>('RAPIDAPI_KEY'),
      'X-RapidAPI-Host': 'opencritic-api.p.rapidapi.com',
    };
  }

  /**
   * Search for a game by name
   */
  async searchGames(query: string): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.get('/game/search', {
        headers: this.headers,
        params: { criteria: query },
      }).pipe(
        catchError((error) => {
          throw new HttpException(
            error.response?.data || 'Error fetching data from OpenCritic',
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    return data;
  }

  /**
   * Get detailed information and scores for a specific game by ID
   */
  async getGameDetails(gameId: number): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.get(`/game/${gameId}`, {
        headers: this.headers,
      }).pipe(
        catchError((error) => {
          throw new HttpException(
            error.response?.data || 'Error fetching game details',
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    return data;
  }
}