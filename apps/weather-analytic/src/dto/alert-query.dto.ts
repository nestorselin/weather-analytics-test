import { IsOptional, IsEnum, IsString, IsDateString } from "class-validator";
import { WeatherAlertEnum } from "../enums/weather-alert.enum";

export class AlertQueryDto {
  @IsOptional()
  @IsString()
  cityName?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(WeatherAlertEnum)
  type?: WeatherAlertEnum;
}
