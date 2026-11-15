import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DomainError } from '@lms/shared-kernel';
import { statusFromCode } from '../error-code-to-status';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message: unknown = 'Internal server error';

    if (exception instanceof DomainError) {
      status = statusFromCode(exception.code);
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = 'HTTP_ERROR';
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const resObj = response as Record<string, unknown>;
        message = resObj['message'] ?? response;
        if (resObj['error']) {
          code = String(resObj['error']).toUpperCase().replace(/\s+/g, '_');
        }
      } else {
        message = response;
      }
    } else {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    res.status(status).json({
      statusCode: status,
      code,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
