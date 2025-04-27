import { Test, TestingModule } from '@nestjs/testing';
import { OpenWeatherClientService } from './open-weather-client.service';

describe('OpenWeatherClientService', () => {
  let service: OpenWeatherClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenWeatherClientService],
    }).compile();

    service = module.get<OpenWeatherClientService>(OpenWeatherClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
