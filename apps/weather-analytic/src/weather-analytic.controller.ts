import { Controller, Get, Query } from "@nestjs/common";
import { WeatherQueryDto } from "./dto/weather-query.dto";
import { AlertQueryDto } from "./dto/alert-query.dto";
import { WeatherAnalyticsService } from "./services/weather-analytics.service";

@Controller("analytics")
export class WeatherAnalyticsController {
  constructor(private readonly weatherService: WeatherAnalyticsService) {}

  @Get("reports")
  getWeatherReports(@Query() query: WeatherQueryDto) {
    return this.weatherService.queryWeatherReports(query);
  }

  @Get("alerts")
  getWeatherAlerts(@Query() query: AlertQueryDto) {
    return this.weatherService.queryWeatherAlerts(query);
  }

  @Get("trends")
  getWeatherTrends(@Query("cities") cities: string[], @Query("days") days = 7) {
    return this.weatherService.queryTrendAnalysis(cities, days);
  }
}
