import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Logger } from "@nestjs/common";
import { CityEntity } from "../entities/city.entity";
import { WeatherReportEntity } from "../entities/weather-report.entity";
import { WeatherAlertEntity } from "../entities/weather-alert.entity";
import { ReportService } from "../../../../libs/modules";
import { WEATHER_FETCH_JOB, WEATHER_FETCH_QUEUE } from "./weather.publisher";
import { WeatherAlertEnum } from "../enums/weather-alert.enum";
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull'; //

@Processor(WEATHER_FETCH_QUEUE)
export class WeatherConsumer {
  private readonly logger = new Logger(WeatherConsumer.name);

  constructor(
    @InjectRepository(CityEntity)
    private readonly cityRepo: Repository<CityEntity>,
    @InjectRepository(WeatherReportEntity)
    private readonly reportRepo: Repository<WeatherReportEntity>,
    @InjectRepository(WeatherAlertEntity)
    private readonly alertRepo: Repository<WeatherAlertEntity>,
    private readonly reportService: ReportService,
  ) {}

  @Process(WEATHER_FETCH_JOB)
  async handleCityWeatherJob(job: Job<{ cityId: string }>) {
    console.log("here")
    const city = await this.cityRepo.findOneOrFail({ where: { id: job.data.cityId } });
    console.log(city);
    const dangerTemp = 35;
    const dangerWind = 50;

    const attempt = job.attemptsMade + 1;
    this.logger.log(`[${attempt}/${job.opts.attempts}] Fetching ${city.name}`);

    try {
      const data = await this.reportService.fetchReportData("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: city.latitude,
          longitude: city.longitude,
          current_weather: true,
          timezone: "auto",
        },
      });

      const report = this.reportRepo.create({
        city,
        temperature: data.current_weather.temperature,
        windSpeed: data.current_weather.windspeed,
        windDirection: data.current_weather.winddirection,
        timestamp: new Date(data.current_weather.time),
      });

      const savedReport = await this.reportRepo.save(report);
      this.logger.log(`Saved report for ${city.name}`);

      if (city.isAlertSystemOn) {
        const alerts: WeatherAlertEntity[] = [];

        if (report.temperature > dangerTemp) {
          alerts.push(
            this.alertRepo.create({
              city,
              weatherReport: savedReport,
              type: WeatherAlertEnum.HIGH_TEMPERATURE,
              timestamp: report.timestamp,
            }),
          );
        }

        if (report.windSpeed > dangerWind) {
          alerts.push(
            this.alertRepo.create({
              city,
              weatherReport: savedReport,
              type: WeatherAlertEnum.HIGH_WIND_SPEED,
              timestamp: report.timestamp,
            }),
          );
        }

        if (alerts.length > 0) {
          await this.alertRepo.save(alerts);
          this.logger.warn(`Alerts triggered for ${city.name}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed job for ${city.name}: ${error.message}`);
      throw error;
    }
  }
}
