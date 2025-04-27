import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { TimePartEnum } from '../open-weather-client/enum/time-part.enum';

describe('WeatherController', () => {
  let controller: WeatherController;
  let service: WeatherService;

  const mockCurrentWeatherData = {
    dt: 1627884600,
    sunrise: 1627884600,
    sunset: 1627938900,
    temp: 25.7,
    feels_like: 26.2,
    pressure: 1015,
    humidity: 60,
    uvi: 6.2,
    wind_speed: 4.5,
    weather: [
      { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
    ],
  };

  const mockWeatherService = {
    fetchAndSaveWeather: jest.fn(),
    getWeatherFromDb: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    service = module.get<WeatherService>(WeatherService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetchAndSaveWeather', () => {
    it('should call weatherService.fetchAndSaveWeather with the provided DTO', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };

      mockWeatherService.fetchAndSaveWeather.mockResolvedValue(
        mockCurrentWeatherData,
      );

      // When
      const result = await controller.fetchAndSaveWeather(weatherRequestDto);

      // Then
      expect(service.fetchAndSaveWeather).toHaveBeenCalledWith(
        weatherRequestDto,
      );
      expect(result).toEqual(mockCurrentWeatherData);
    });
  });

  describe('getWeather', () => {
    it('should call weatherService.getWeatherFromDb with the provided DTO', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };

      mockWeatherService.getWeatherFromDb.mockResolvedValue(
        mockCurrentWeatherData,
      );

      // When
      const result = await controller.getWeather(weatherRequestDto);

      // Then
      expect(service.getWeatherFromDb).toHaveBeenCalledWith(weatherRequestDto);
      expect(result).toEqual(mockCurrentWeatherData);
    });
  });
});
