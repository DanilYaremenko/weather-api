import { Module } from '@nestjs/common';
import { OpenWeatherClientService } from './open-weather-client.service';

@Module({
  providers: [OpenWeatherClientService],
  exports: [OpenWeatherClientService],
})
export class OpenWeatherClientModule {}
