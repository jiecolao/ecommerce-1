import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { createProviderException } from '../provider-error';

@Injectable()
export class OpencriticService {
  // Logger
  private readonly logger = new Logger(OpencriticService.name);
  private readonly headers: Record<string, string>;
  private readonly baseUrl = 'https://opencritic-api.p.rapidapi.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.headers = {
      'X-RapidAPI-Key': this.configService.get<string>('RAPIDAPI_KEY')!,
      'X-RapidAPI-Host': 'opencritic-api.p.rapidapi.com',
    };
  }
  
  async getGameInfo(opencriticId: string): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.get(`/game/${opencriticId}`, {
        baseURL: this.baseUrl,
        headers: this.headers,
      }).pipe(
        catchError((error) => {
          this.logger.error('OpenCritic API request failed.');
          throw createProviderException(error, 'opencritic');
        })
      ),
    ) as any;
    
    return data;
  }

  async getGameReviews(opencriticId: string): Promise<any> {

    const { data } = await firstValueFrom(
      this.httpService.get(`/review/game/${opencriticId}`, {
        baseURL: this.baseUrl,
        headers: this.headers,
      }).pipe(
        catchError((error) => {
          this.logger.error('OpenCritic API request failed.');
          throw createProviderException(error, 'opencritic');
        })
      ),
    ) as any;
    
    return data;
  }
}
