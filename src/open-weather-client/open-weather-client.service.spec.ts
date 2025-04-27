import { Test, TestingModule } from '@nestjs/testing';
import { OpenWeatherClientService } from './open-weather-client.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TimePartEnum } from './enum/time-part.enum';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenWeatherClientService', () => {
  let service: OpenWeatherClientService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockWeatherResponse = {
    data: {
      lat: 51.5074,
      lon: 0.1278,
      current: {
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
      },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Set default behavior for configService.get
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'OPEN_WEATHER_API_URL') return 'http://mock-api.com';
      if (key === 'OPEN_WEATHER_API_KEY') return 'mock-api-key';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenWeatherClientService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OpenWeatherClientService>(OpenWeatherClientService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeatherData', () => {
    it('should fetch current weather data successfully', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };
      mockedAxios.get.mockResolvedValue(mockWeatherResponse);

      // When
      const result = await service.getWeatherData(weatherRequestDto);

      // Then
      expect(mockedAxios.get).toHaveBeenCalledWith('http://mock-api.com', {
        params: {
          lat: '51.5074',
          lon: '0.1278',
          appid: 'mock-api-key',
          exclude: 'hourly,daily,minutely,alerts',
        },
      });
      expect(result).toEqual(mockWeatherResponse.data.current);
    });

    it('should throw error when api key is not provided', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };

      mockConfigService.get.mockClear();
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPEN_WEATHER_API_URL') return 'http://mock-api.com';
        if (key === 'OPEN_WEATHER_API_KEY') return null; // Return null for API key
        return null;
      });

      const testModule = await Test.createTestingModule({
        providers: [
          OpenWeatherClientService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = testModule.get<OpenWeatherClientService>(
        OpenWeatherClientService,
      );

      // When & Then
      await expect(
        testService.getWeatherData(weatherRequestDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error when API request fails', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);

      // When & Then
      await expect(service.getWeatherData(weatherRequestDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw error with API response details when API returns error', async () => {
      // Given
      const weatherRequestDto = {
        lat: 51.5074,
        lon: 0.1278,
        part: TimePartEnum.CURRENT,
      };
      const responseError = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'Invalid API key' },
        },
      };
      mockedAxios.get.mockRejectedValue(responseError);

      // When & Then
      await expect(service.getWeatherData(weatherRequestDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
