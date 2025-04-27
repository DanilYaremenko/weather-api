import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherRequestDto } from './dto/weather-request-data.dto';
import axios from 'axios';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  OpenWeatherResponse,
} from './interface/open-weather-response.interface';
import { TimePartEnum } from './enum/time-part.enum';

@Injectable()
export class OpenWeatherClientService {
  private readonly logger = new Logger(OpenWeatherClientService.name);
  private readonly openWeatherBaseUrl: string;
  private readonly apiKey: string;
  private readonly DEFAULT_EXCLUDE = ',minutely,alerts';

  constructor(private readonly configService: ConfigService) {
    this.openWeatherBaseUrl = this.configService.get<string>(
      'OPEN_WEATHER_API_URL',
    );
    this.apiKey = this.configService.get<string>('OPEN_WEATHER_API_KEY');
  }

  async getWeatherData(
    dto: WeatherRequestDto,
  ): Promise<CurrentWeather | HourlyForecast[] | DailyForecast[]> {
    try {
      if (!this.apiKey || !this.openWeatherBaseUrl) {
        this.logger.error('OpenWeather API URL or key not found');
        throw new InternalServerErrorException(
          'OpenWeather API URL or key not found',
        );
      }

      const allParts = Object.values(TimePartEnum);
      const excludeParts = allParts.filter((part) => part !== dto.part);
      const exclude = excludeParts.join(',') + this.DEFAULT_EXCLUDE;

      const params = {
        lat: dto.lat.toString(),
        lon: dto.lon.toString(),
        appid: this.apiKey,
        exclude,
      };

      this.logger.debug(
        `Fetching weather data for lat: ${dto.lat}, lon: ${dto.lon}, part: ${dto.part}`,
      );

      const response = await axios.get<OpenWeatherResponse>(
        this.openWeatherBaseUrl,
        { params },
      );

      return response.data[dto.part];
    } catch (error) {
      if (error.response) {
        this.logger.error(
          `OpenWeather API error: ${error.response.status} ${error.response.statusText}`,
        );
      } else {
        this.logger.error(`Error fetching weather data: ${error.message}`);
      }
      throw new InternalServerErrorException(
        `Error fetching weather data from OpenWeather API: ${error.message}`,
      );
    }
  }
}
