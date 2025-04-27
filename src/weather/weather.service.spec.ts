import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { OpenWeatherClientService } from '../open-weather-client/open-weather-client.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WeatherData } from './entity/weather-data.entity';
import { TimePartEnum } from '../open-weather-client/enum/time-part.enum';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('WeatherService', () => {
  let service: WeatherService;
  let openWeatherClientService: OpenWeatherClientService;
  let weatherRepository: Repository<WeatherData>;

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

  const mockWeatherEntity = {
    id: '1',
    lat: 51.5074,
    lon: 0.1278,
    part: TimePartEnum.CURRENT,
    data: mockCurrentWeatherData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockWeatherRepository = {
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockOpenWeatherClientService = {
    getWeatherData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getRepositoryToken(WeatherData),
          useValue: mockWeatherRepository,
        },
        {
          provide: OpenWeatherClientService,
          useValue: mockOpenWeatherClientService,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    openWeatherClientService = module.get<OpenWeatherClientService>(
      OpenWeatherClientService,
    );
    weatherRepository = module.get<Repository<WeatherData>>(
      getRepositoryToken(WeatherData),
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAndSaveWeather', () => {
    it('should fetch weather data and save it to the database', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };

      mockOpenWeatherClientService.getWeatherData.mockResolvedValue(
        mockCurrentWeatherData,
      );
      mockWeatherRepository.save.mockResolvedValue(mockWeatherEntity);

      // When
      const result = await service.fetchAndSaveWeather(weatherRequestDto);

      // Then
      expect(openWeatherClientService.getWeatherData).toHaveBeenCalledWith(
        weatherRequestDto,
      );
      expect(weatherRepository.save).toHaveBeenCalledWith({
        lat: weatherRequestDto.lat,
        lon: weatherRequestDto.lon,
        part: weatherRequestDto.part,
        data: mockCurrentWeatherData,
      });
      expect(result).toEqual(mockCurrentWeatherData);
    });
  });

  describe('getWeatherFromDb', () => {
    it('should retrieve weather data from database', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockWeatherEntity);

      // When
      const result = await service.getWeatherFromDb(weatherRequestDto);

      // Then
      expect(mockWeatherRepository.createQueryBuilder).toHaveBeenCalledWith(
        'weather',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'weather.lat = :lat',
        { lat: weatherRequestDto.lat },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'weather.lon = :lon',
        { lon: weatherRequestDto.lon },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'weather.part = :part',
        { part: weatherRequestDto.part },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'weather.created_at',
        'DESC',
      );
      expect(result).toEqual(mockCurrentWeatherData);
    });

    it('should handle case when part is null', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: null,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockWeatherEntity);

      // When
      await service.getWeatherFromDb(weatherRequestDto);

      // Then
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'weather.part IS NULL',
      );
    });

    it('should throw NotFoundException when no weather data found', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };

      mockQueryBuilder.getOne.mockResolvedValue(null);

      // When & Then
      await expect(service.getWeatherFromDb(weatherRequestDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
