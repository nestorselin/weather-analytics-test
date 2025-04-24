import { Module } from "@nestjs/common";
import { ReportService } from "./report.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
