import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConstantsService {
  constructor(private readonly config: ConfigService) {}

  // Application Settings
  NODE_ENV = this.config.get('NODE_ENV');
  PORT = parseInt(this.config.get('PORT')) || 3000;
  APP_NAME = this.config.get('APP_NAME') || 'Loan Management API';

  // JWT Configuration
  JWT_SECRET =
    this.config.get('JWT_SECRET') ||
    'your-super-secret-jwt-key-change-in-production';
  JWT_EXPIRES_IN = this.config.get('JWT_EXPIRES_IN') || '1h';

  // Security Configuration
  BCRYPT_SALT_ROUNDS = parseInt(this.config.get('BCRYPT_SALT_ROUNDS')) || 12;

  // Rate Limiting
  THROTTLE_TTL = parseInt(this.config.get('THROTTLE_TTL')) || 60;
  THROTTLE_LIMIT = parseInt(this.config.get('THROTTLE_LIMIT')) || 10;

  // CORS Settings
  CORS_ORIGIN = this.config.get('CORS_ORIGIN') || 'http://localhost:3000';
  CORS_CREDENTIALS = this.config.get('CORS_CREDENTIALS') === 'true';

  // Helper methods
  get isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  get isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
}
