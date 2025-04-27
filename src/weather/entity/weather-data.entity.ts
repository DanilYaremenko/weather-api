import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
} from '../../open-weather-client/interface/open-weather-response.interface';

@Entity('weather_data')
export class WeatherData {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'decimal' })
  lat: number;

  @Column({ type: 'decimal' })
  lon: number;

  @Column({ nullable: true })
  part: string;

  @Column({ type: 'jsonb' })
  data: CurrentWeather | HourlyForecast[] | DailyForecast[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
