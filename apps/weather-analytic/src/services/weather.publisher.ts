import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { CityEntity } from "../entities/city.entity";

export const WEATHER_FETCH_QUEUE = "weather-fetch";
export const WEATHER_FETCH_JOB = "fetch-city-weather";

@Injectable()
export class WeatherPublisherService {
  constructor(@InjectQueue(WEATHER_FETCH_QUEUE) private readonly weatherQueue: Queue) {}

  async publishAllCities(cities: CityEntity[]) {
    await Promise.all(
      cities.map((city) =>
        this.weatherQueue.add(
          WEATHER_FETCH_JOB,
          { cityId: city.id },
          {
            attempts: 5,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: true,
            removeOnFail: true,
          },
        ),
      ),
    );
  }
}
