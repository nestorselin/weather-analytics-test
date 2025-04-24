export interface ApiWeatherData {
  cityName: string;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    time: string;
  };
}

export interface PreparedWeatherData {
  cityName: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  timestamp: Date;
}
