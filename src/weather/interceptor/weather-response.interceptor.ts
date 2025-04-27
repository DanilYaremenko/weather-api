import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WeatherResponseDto } from '../dto/weather-response.dto';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
} from '../../open-weather-client/interface/open-weather-response.interface';
import { TimePartEnum } from '../../open-weather-client/enum/time-part.enum';
import { Request } from 'express';

const DEFAULT_EMPTY_RESPONSE = {
  sunrise: null,
  sunset: null,
  temp: null,
  feels_like: null,
  pressure: null,
  humidity: null,
  uvi: null,
  wind_speed: null,
};

@Injectable()
export class WeatherResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<WeatherResponseDto | WeatherResponseDto[]> {
    const request = context.switchToHttp().getRequest<Request>();
    const part: TimePartEnum = request.query.part || request.body.part;

    return next.handle().pipe(
      map((data) => {
        if (!data) {
          return DEFAULT_EMPTY_RESPONSE;
        }

        switch (part) {
          case TimePartEnum.CURRENT:
            return this.formatWeather(data as CurrentWeather);
          case TimePartEnum.HOURLY:
            return (data as HourlyForecast[]).map((item) =>
              this.formatWeather(item),
            );
          case TimePartEnum.DAILY:
            return (data as DailyForecast[]).map((item) =>
              this.formatWeather(item),
            );
          default:
            return DEFAULT_EMPTY_RESPONSE;
        }
      }),
    );
  }

  private formatWeather(
    data: CurrentWeather | HourlyForecast | DailyForecast,
  ): WeatherResponseDto {
    const { temp, feels_like, pressure, humidity, uvi, wind_speed } = data;

    const result: WeatherResponseDto = {
      sunrise: 'sunrise' in data ? data.sunrise : null,
      sunset: 'sunset' in data ? data.sunset : null,
      temp,
      feels_like,
      pressure,
      humidity,
      uvi,
      wind_speed,
    };

    return result;
  }
}
