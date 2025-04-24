import { IsOptional, IsString, IsDateString, IsNumberString } from "class-validator";

export class WeatherQueryDto {
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
  @IsNumberString()
  minTemperature?: number;

  @IsOptional()
  @IsNumberString()
  maxTemperature?: number;
}
