import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('REPORTS_SERVICE') private client: ClientProxy) {}

  async getHello(): Promise<string> {
    this.client.emit('report_created', { error: true });

    return 'Hola mundo';
  }
}
