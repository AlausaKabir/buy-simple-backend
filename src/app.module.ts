import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { LoanModule } from './modules/loan/loan.module';
import { ConstantsService } from './config/constant.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: (parseInt(configService.get('THROTTLE_TTL')) || 60) * 1000, // Convert to milliseconds
          limit: parseInt(configService.get('THROTTLE_LIMIT')) || 10,
        },
        {
          name: 'long',
          ttl: 300000, // 5 minutes
          limit: 100,
        },
      ],
      inject: [ConfigService],
    }),
    AuthModule,
    LoanModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConstantsService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
