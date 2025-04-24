import { Entity, Column, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CityEntity } from "./city.entity";
import { WeatherAlertEntity } from "./weather-alert.entity";

@Entity('weather_reports')
export class WeatherReportEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => CityEntity, city => city.reports, { onDelete: 'CASCADE' })
  city: CityEntity;

  @Column('float')
  temperature: number;

  @Column('float')
  windSpeed: number;

  @Column('float')
  windDirection: number;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @OneToMany(() => WeatherAlertEntity, alert => alert.weatherReport)
  alerts: WeatherAlertEntity[];
}
