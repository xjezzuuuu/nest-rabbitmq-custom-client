import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('REPORTS_SERVICE') private reportsClient: ClientProxy,
  ) {}

  @Get()
  getHello(): Promise<string> {
    this.reportsClient
      .emit('reports', { msg: 'hola' })
      .subscribe((response) => console.log(response));
    return new Promise((resolve) => resolve('hola'));
  }
}
