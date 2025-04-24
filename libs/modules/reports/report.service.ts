import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { AxiosRequestConfig } from "axios";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private readonly httpService: HttpService) {}
  async fetchPostData(url: string, data: any, config: AxiosRequestConfig): Promise<any> {
    return this.httpService
      .post(url, data, config)
      .toPromise()
      .then((response) => response?.data)
      .catch((error) => {
        this.logger.error(`Failed to fetch post data.`);
        throw new InternalServerErrorException(error);
      });
  }
  async fetchReportData(url: string, config: AxiosRequestConfig): Promise<any> {
    return this.httpService
      .get(url, config)
      .toPromise()
      .then((response) => response?.data)
      .catch((error) => {
        this.logger.error("Failed to fetch report data.");
        throw new InternalServerErrorException(error);
      });
  }
}
