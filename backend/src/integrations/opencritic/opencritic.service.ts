import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";

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
          this.logger.error('OpenCritic API Error:', error.message, error.stack);
          throw new HttpException(
            error.response?.data || 'Error fetching data from OpenCritic',
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          ); 
        })
      ),
    );
    
    return data;
  }

  async getGameReviews(opencriticId: string): Promise<any> {

    const { data } = await firstValueFrom(
      this.httpService.get(`/review/game/${opencriticId}`, {
        baseURL: this.baseUrl,
        headers: this.headers,
      }).pipe(
        catchError((error) => {
          this.logger.error('OpenCritic API Error:', error.message, error.stack);
          throw new HttpException(
            error.response?.data || 'Error fetching data from OpenCritic',
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          ); 
        })
      ),
    );
    
    return data;
  }
}
