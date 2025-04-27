import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
} from '../open-weather-client/interface/open-weather-response.interface';
import { WeatherRequestDto } from '../open-weather-client/dto/weather-request-data.dto';
import { WeatherResponseInterceptor } from './interceptor/weather-response.interceptor';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  async fetchAndSaveWeather(
    @Body() dto: WeatherRequestDto,
  ): Promise<CurrentWeather | HourlyForecast[] | DailyForecast[]> {
    return this.weatherService.fetchAndSaveWeather(dto);
  }

  @Get()
  @UseInterceptors(WeatherResponseInterceptor)
  async getWeather(
    @Query() dto: WeatherRequestDto,
  ): Promise<CurrentWeather | HourlyForecast[] | DailyForecast[]> {
    return this.weatherService.getWeatherFromDb(dto);
  }
}
