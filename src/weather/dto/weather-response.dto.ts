import { IsNumber, IsOptional } from 'class-validator';

export class WeatherResponseDto {
  @IsOptional()
  @IsNumber()
  sunrise?: number;

  @IsOptional()
  @IsNumber()
  sunset?: number;

  @IsOptional()
  temp?:
    | number
    | {
        day: number;
        min?: number;
        max?: number;
        night: number;
        eve: number;
        morn: number;
      };

  @IsOptional()
  feels_like?:
    | number
    | {
        day: number;
        night: number;
        eve: number;
        morn: number;
      };

  @IsOptional()
  @IsNumber()
  pressure?: number;

  @IsOptional()
  @IsNumber()
  humidity?: number;

  @IsOptional()
  @IsNumber()
  uvi?: number;

  @IsOptional()
  @IsNumber()
  wind_speed?: number;
}
