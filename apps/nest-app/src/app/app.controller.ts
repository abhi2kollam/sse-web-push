import { Body, Controller, Get, Post, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { interval, map, Observable } from 'rxjs';

const webpush = require('web-push');

const vapidKeys = {
  publicKey:
    'BEpHQo8DZGEvUGintoD89LllZrucBK3ggpB1uiq1aJe0PAWx8xWkPrf6prR3noFlQE2LaZtJPMG_cs8sPVnYJ_0',
  privateKey: 'rNVZwZLtbBozBmz3S5MnM0EvrZiSQsvhwbqCuy1yJKA',
};

const options = {
  vapidDetails: {
    subject: 'mailto: <abhi2kollam@gmail.com>',
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey,
  },
  TTL: 60,
};
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@Controller()
export class AppController {
  subscription = null;
  constructor(private readonly appService: AppService) {}

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
  }

  @Get()
  getData() {
    this.sendNotification();
    return this.appService.getData();
  }

  @Post()
  sendNotification1(@Body() payload: any): any {
    this.subscription = payload;
    return { success: true };
  }

  private sendNotification() {
    if (!this.subscription) {
      return;
    }
    webpush
      .sendNotification(
        this.subscription,
        JSON.stringify({
          notification: {
            title: 'Our first push notification',
            body: 'Here you can add some text',
          },
        }),
        options
      )
      .then((log) => {
        console.log('Push notification sent.');
        console.log(log);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
