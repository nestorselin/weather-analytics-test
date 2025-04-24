import { Entity, Column, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { WeatherAlertEnum } from "../enums/weather-alert.enum";
import { CityEntity } from "./city.entity";
import { WeatherReportEntity } from "./weather-report.entity";

@Entity("weather_alerts")
@Index(["city", "timestamp"])
export class WeatherAlertEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => CityEntity, (city) => city.alerts, { onDelete: "CASCADE" })
  city: CityEntity;

  @ManyToOne(() => WeatherReportEntity, (report) => report.alerts, { onDelete: "CASCADE" })
  weatherReport: WeatherReportEntity;

  @Column({
    type: "enum",
    enum: WeatherAlertEnum,
  })
  type: WeatherAlertEnum;

  @Column({ type: "timestamptz" })
  timestamp: Date;
}
