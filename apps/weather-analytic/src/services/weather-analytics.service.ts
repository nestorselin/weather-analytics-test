import { WeatherReportEntity } from "../entities/weather-report.entity";
import { Repository } from "typeorm";
import { WeatherAlertEntity } from "../entities/weather-alert.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { WeatherQueryDto } from "../dto/weather-query.dto";
import { AlertQueryDto } from "../dto/alert-query.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class WeatherAnalyticsService {
  constructor(
    @InjectRepository(WeatherReportEntity)
    private readonly reportRepo: Repository<WeatherReportEntity>,
    @InjectRepository(WeatherAlertEntity)
    private readonly alertRepo: Repository<WeatherAlertEntity>,
  ) {}

  async queryWeatherReports(query: WeatherQueryDto) {
    const qb = this.reportRepo.createQueryBuilder("report").leftJoinAndSelect("report.city", "city");

    if (query.cityName) {
      qb.andWhere("city.name = :cityName", { cityName: query.cityName });
    }

    if (query.startDate) {
      qb.andWhere("report.timestamp >= :start", { start: query.startDate });
    }

    if (query.endDate) {
      qb.andWhere("report.timestamp <= :end", { end: query.endDate });
    }

    if (query.minTemperature) {
      qb.andWhere("report.temperature >= :minTemp", { minTemp: query.minTemperature });
    }

    if (query.maxTemperature) {
      qb.andWhere("report.temperature <= :maxTemp", { maxTemp: query.maxTemperature });
    }

    return qb.orderBy("report.timestamp", "DESC").limit(100).getMany();
  }

  async queryWeatherAlerts(query: AlertQueryDto) {
    const qb = this.alertRepo.createQueryBuilder("alert").leftJoinAndSelect("alert.city", "city");

    if (query.cityName) {
      qb.andWhere("city.name = :cityName", { cityName: query.cityName });
    }

    if (query.startDate) {
      qb.andWhere("alert.timestamp >= :start", { start: query.startDate });
    }

    if (query.endDate) {
      qb.andWhere("alert.timestamp <= :end", { end: query.endDate });
    }

    if (query.type) {
      qb.andWhere("alert.type = :type", { type: query.type });
    }

    return qb.orderBy("alert.timestamp", "DESC").limit(100).getMany();
  }

  async queryTrendAnalysis(cities: string[], days: number) {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.reportRepo
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.city", "city")
      .select("city.name", "city")
      .addSelect("DATE(report.timestamp)", "date")
      .addSelect("AVG(report.temperature)", "avgTemp")
      .addSelect("AVG(report.windSpeed)", "avgWind")
      .where("report.timestamp >= :sinceDate", { sinceDate })
      .andWhere("city.name IN (:...cities)", { cities })
      .groupBy("city.name")
      .addGroupBy("DATE(report.timestamp)")
      .orderBy("date", "ASC")
      .getRawMany();
  }
}
