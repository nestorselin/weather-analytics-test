import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.enableCors();
  app.set("trust proxy", 1);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const env = process.env.NODE_ENV || "development";
  const port = process.env.SERVER_PORT || 3008;

  logger.log(`ENV: NODE_ENV - ${env}`);

  await app.listen(port);

  return { env };
}

bootstrap();
