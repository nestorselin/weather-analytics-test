import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import * as Sentry from "@sentry/node";

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  trackableErrTypes = [InternalServerErrorException, TypeError];

  constructor(private env) {
    this.env = env;
  }

  useSentry = (err) => {
    const sendToSentry = this.trackableErrTypes.some((errorType) => err instanceof errorType);

    if (sendToSentry || this.env?.SENTRY_TRACK_ALL_ERR_TYPES === "true") {
      Sentry.captureException(err);
    }

    return throwError(() => err);
  };

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    let processError = (err) => throwError(() => err);

    if (this.env.NODE_ENV === "production" || this.env?.SENTRY_TRACK_ALL_ENV === "true") {
      processError = this.useSentry;
    }

    return next.handle().pipe(catchError(processError));
  }
}
