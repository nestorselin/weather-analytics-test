import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiWeatherData, PreparedWeatherData } from "../interfaces/weather.interface";
import { ReportService } from "../../../../libs/modules";
import { WeatherReportEntity } from "../entities/weather-report.entity";
import { CityEntity } from "../entities/city.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { WeatherAlertEntity } from "../entities/weather-alert.entity";
import { WeatherAlertEnum } from "../enums/weather-alert.enum";
import { Cron, CronExpression } from "@nestjs/schedule";
import { WeatherPublisherService } from "./weather.publisher";

@Injectable()
export class WeatherAlertService implements OnModuleInit {
  private readonly logger = new Logger(WeatherAlertService.name);
  private readonly dangerTemperature: number;
  private readonly dangerWindSpeed: number;
  private readonly openMeteoUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly reportService: ReportService,
    private readonly weatherPublisher: WeatherPublisherService,

    @InjectRepository(WeatherReportEntity)
    private weatherReportRepository: Repository<WeatherReportEntity>,
    @InjectRepository(CityEntity)
    private readonly cityRepository: Repository<CityEntity>,
    @InjectRepository(WeatherAlertEntity)
    private weatherAlertRepository: Repository<WeatherAlertEntity>,
  ) {
    this.dangerTemperature = this.configService.get<number>("dangerTemperature") ?? 35;
    this.dangerWindSpeed = this.configService.get<number>("dangerWindSpeed") ?? 50;
    this.openMeteoUrl = this.configService.get<string>("openMeteoUrl") ?? "https://api.open-meteo.com/v1/forecast";
  }

  async onModuleInit() {
    try {
       await this.seedCities();
       await this.getWeatherReports();
    } catch (error) {
      this.logger.error("Startup failure", error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleCityFetch() {

    // todo finish queues
    // const cities = await this.cityRepository.find();
    // await this.weatherPublisher.publishAllCities(cities);

    await this.getWeatherReports();
    const cities = await this.cityRepository.find();
    await this.weatherPublisher.publishAllCities(cities);
  }


  // todo implement migrations
  private async seedCities() {
    const predefinedCities = [
      { name: "Tel Aviv", latitude: 32.0853, longitude: 34.7818, isAlertSystemOn: true },
      { name: "Haifa", latitude: 32.794, longitude: 34.9896, isAlertSystemOn: true },
      { name: "Jerusalem", latitude: 31.7683, longitude: 35.2137, isAlertSystemOn: true },
      { name: "Beersheba", latitude: 31.2529, longitude: 34.7915, isAlertSystemOn: false },
      { name: "Eilat", latitude: 29.5581, longitude: 34.9482, isAlertSystemOn: false },
    ];

    for (const city of predefinedCities) {
      const exists = await this.cityRepository.findOne({
        where: {
          name: city.name,
        },
      });
      if (!exists) {
        this.logger.log(`Seeded city: ${city.name}`);
        const cityEntity = this.cityRepository.create(city);
        await this.cityRepository.save(cityEntity);
      }
    }
  }

  async getWeatherReports(): Promise<PreparedWeatherData[]> {
    const cities = await this.cityRepository.find();
    const results: PreparedWeatherData[] = [];

    for (const city of cities) {
      try {
        const data: ApiWeatherData = await this.reportService.fetchReportData(this.openMeteoUrl, {
          params: {
            latitude: city.latitude,
            longitude: city.longitude,
            current_weather: true,
            timezone: "auto",
          },
        });

        const transformed: PreparedWeatherData = {
          cityName: city.name,
          temperature: data.current_weather.temperature,
          windSpeed: data.current_weather.windspeed,
          windDirection: data.current_weather.winddirection,
          timestamp: new Date(data.current_weather.time),
        };

        const reportEntity = this.weatherReportRepository.create({
          city,
          temperature: transformed.temperature,
          windSpeed: transformed.windSpeed,
          windDirection: transformed.windDirection,
          timestamp: transformed.timestamp,
        });

        const savedReport = await this.weatherReportRepository.save(reportEntity);

        this.logger.log(`Processed weather for ${city.name}`);
        results.push(transformed);

        if (city.isAlertSystemOn) {
          const alerts: WeatherAlertEntity[] = [];

          if (transformed.temperature > this.dangerTemperature) {
            alerts.push(
              this.weatherAlertRepository.create({
                city,
                weatherReport: savedReport,
                type: WeatherAlertEnum.HIGH_TEMPERATURE,
                timestamp: transformed.timestamp,
              }),
            );
            this.logger.warn(`Temperature alert in ${city.name} (${transformed.temperature}°C)`);
          }

          if (transformed.windSpeed > this.dangerWindSpeed) {
            alerts.push(
              this.weatherAlertRepository.create({
                city,
                weatherReport: savedReport,
                type: WeatherAlertEnum.HIGH_WIND_SPEED,
                timestamp: transformed.timestamp,
              }),
            );
            this.logger.warn(`Wind alert in ${city.name} (${transformed.windSpeed} km/h)`);
          }

          if (alerts.length > 0) {
            await this.weatherAlertRepository.save(alerts);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to process weather for ${city.name}: ${error.message}`);
        throw new InternalServerErrorException(`Weather API error for ${city.name}: ${error.message}`);
      }
    }

    this.logger.log(`Finished processing ${results.length}/${cities.length} cities`);
    return results;
  }
}
