import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';
import { TimePartEnum } from '../enum/time-part.enum';

export class WeatherRequestDto {
  @IsNotEmpty()
  @IsLatitude()
  lat: number;

  @IsNotEmpty()
  @IsLongitude()
  lon: number;

  @IsNotEmpty()
  @IsEnum(TimePartEnum)
  part: TimePartEnum;
}
