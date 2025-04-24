import * as process from "process";

export const configFile = () => ({
  environment: process.env.NODE_ENV,
  serverPort: process.env.SERVER_PORT,
  dangerTemperature: process.env.DANGER_TEMPERATURE,
  dangerWindSpeed: process.env.DANGER_WIND_SPEED,
  openMeteoUrl: process.env.OPEN_METEO_URL!,

  dbConfigs: {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    migrations: [__dirname + "/../../../../migrations/*{.ts,.js}"],
    synchronize: true,
    autoLoadEntities: true,
    logging: true,
    logger: "file",
  },
});
