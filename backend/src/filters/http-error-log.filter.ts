import { Catch, HttpException, HttpStatus, IntrinsicException, Logger } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class HttpErrorLogFilter extends BaseExceptionFilter<unknown> {
  private readonly logger = new Logger(HttpErrorLogFilter.name);

  override catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      super.catch(exception, host);
      return;
    }

    // Preserve the installed Nest filter's response for unknown/http-errors
    // failures, without passing raw errors, causes or request data to its logger.
    const body = this.isHttpError(exception)
      ? { statusCode: exception.statusCode, message: exception.message }
      : { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
    super.catch(new HttpException(body, body.statusCode), host);

    // Nest deliberately does not log IntrinsicException; retain that behavior.
    if (!(exception instanceof IntrinsicException)) {
      this.logger.error('Unhandled HTTP request failed.');
    }
  }
}
