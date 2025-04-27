import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenWeatherClientService } from '../open-weather-client/open-weather-client.service';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
} from '../open-weather-client/interface/open-weather-response.interface';
import { WeatherData } from './entity/weather-data.entity';
import { WeatherRequestDto } from '../open-weather-client/dto/weather-request-data.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectRepository(WeatherData)
    private weatherRepository: Repository<WeatherData>,
    private openWeatherClientService: OpenWeatherClientService,
  ) {}

  async fetchAndSaveWeather(
    dto: WeatherRequestDto,
  ): Promise<CurrentWeather | HourlyForecast[] | DailyForecast[]> {
    const weatherResponse = await this.openWeatherClientService.getWeatherData({
      lat: dto.lat,
      lon: dto.lon,
      part: dto.part,
    });

    const weatherData: Partial<WeatherData> = {
      lat: dto.lat,
      lon: dto.lon,
      part: dto.part,
      data: weatherResponse,
    };

    await this.weatherRepository.save(weatherData);

    this.logger.debug(
      `Weather data saved for coordinates lat: ${dto.lat}, lon: ${dto.lon} with part: ${dto.part}`,
    );

    return weatherResponse;
  }

  async getWeatherFromDb(
    dto: WeatherRequestDto,
  ): Promise<CurrentWeather | HourlyForecast[] | DailyForecast[]> {
    const query = this.weatherRepository
      .createQueryBuilder('weather')
      .where('weather.lat = :lat', { lat: dto.lat })
      .andWhere('weather.lon = :lon', { lon: dto.lon });

    if (dto.part) {
      query.andWhere('weather.part = :part', { part: dto.part });
    } else {
      query.andWhere('weather.part IS NULL');
    }

    query.orderBy('weather.created_at', 'DESC');

    const weather = await query.getOne();

    if (!weather) {
      this.logger.warn(
        `Weather data not found for coordinates lat: ${dto.lat}, lon: ${dto.lon}, exclude part: ${dto?.part}`,
      );
      throw new NotFoundException(
        `Weather data for coordinates lat: ${dto.lat}, lon: ${dto.lon}, exclude part ${dto?.part} not found`,
      );
    }

    return weather.data;
  }
}
