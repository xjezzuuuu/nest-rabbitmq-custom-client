import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RmqExchangeClient } from './custom.transport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'REPORTS_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          customClass: RmqExchangeClient,
          options: {
            urls: [configService.get('REPORTS_SERVICE_URL')],
            exchange: configService.get('REPORTS_SERVICE_EXCHANGE_NAME'),
            exchangeType: configService.get('REPORTS_SERVICE_EXCHANGE_TYPE'),
            exchangeRoutingKey: configService.get(
              'REPORTS_SERVICE_EXCHANGE_ROUTING_KEY',
            ),
            exchangeOptions: {
              noAssert: false,
              durable: true,
            },
            queue: configService.get('REPORTS_SERVICE_QUEUE'),
            noAck: true,
            queueOptions: {
              noAssert: false,
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
