import { IsString, IsNumber, IsDate } from "class-validator";

export class WeatherReportDto {
  @IsString()
  cityName: string;

  @IsNumber()
  temperature: number;

  @IsNumber()
  windSpeed: number;

  @IsNumber()
  windDirection: number;

  @IsDate()
  timestamp: Date;
}
