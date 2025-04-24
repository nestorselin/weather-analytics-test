import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { configFile, DatabaseModule, ReportModule } from "../../../libs/modules";
import { CityEntity } from "./entities/city.entity";
import { WeatherAlertEntity } from "./entities/weather-alert.entity";
import { WeatherReportEntity } from "./entities/weather-report.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeatherAnalyticsController } from "./weather-analytic.controller";
import { WeatherAlertService } from "./services/weather-alert.service";
import { WeatherAnalyticsService } from "./services/weather-analytics.service";
import { WEATHER_FETCH_QUEUE, WeatherPublisherService } from "./services/weather.publisher";
import { BullModule } from "@nestjs/bull";
import { WeatherConsumer } from "./services/weather.processor";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    BullModule.registerQueue({ name: WEATHER_FETCH_QUEUE }),
    ScheduleModule.forRoot(),
    ReportModule,
    DatabaseModule,
    TypeOrmModule.forFeature([CityEntity, WeatherAlertEntity, WeatherReportEntity]),
    ConfigModule.forRoot({
      envFilePath: [".env.local", ".env"],
      isGlobal: true,
      load: [configFile],
      validationSchema: Joi.object({
        SERVER_PORT: Joi.number().required(),
      }),
    }),
  ],
  controllers: [WeatherAnalyticsController],
  providers: [WeatherAlertService, WeatherAnalyticsService, WeatherPublisherService, WeatherConsumer],
  exports: [],
})
export class AppModule {}
