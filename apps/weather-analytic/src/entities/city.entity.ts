import { Entity, Column, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { WeatherReportEntity } from "./weather-report.entity";
import { WeatherAlertEntity } from "./weather-alert.entity";

@Entity("cities")
@Index(["name"])
export class CityEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column("float")
  latitude: number;

  @Column("float")
  longitude: number;

  @Column({ type: "boolean", default: false })
  isAlertSystemOn: boolean;

  @OneToMany(() => WeatherReportEntity, (report) => report.city)
  reports: WeatherReportEntity[];

  @OneToMany(() => WeatherAlertEntity, (alert) => alert.city)
  alerts: WeatherAlertEntity[];
}
