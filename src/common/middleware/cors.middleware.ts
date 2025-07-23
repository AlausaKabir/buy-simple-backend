import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConstantsService } from '../../config/constant.service';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly constantsService: ConstantsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const allowedOrigin = this.constantsService.CORS_ORIGIN;
    const credentials = this.constantsService.CORS_CREDENTIALS;

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', credentials.toString());
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization, Origin, X-Requested-With',
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  }
}
