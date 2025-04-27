import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherData } from './entity/weather-data.entity';
import { OpenWeatherClientModule } from '../open-weather-client/open-weather-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([WeatherData]), OpenWeatherClientModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
