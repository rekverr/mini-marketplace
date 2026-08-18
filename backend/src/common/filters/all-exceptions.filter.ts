import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      // Preserve message/structure when possible
      if (typeof res === 'string') message = res;
      else if (typeof res === 'object' && res !== null) message = (res as any).message ?? res;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log full error server-side for diagnostics
    this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : String(exception));

    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status] ?? 'Error',
      message,
    });
  }
}
