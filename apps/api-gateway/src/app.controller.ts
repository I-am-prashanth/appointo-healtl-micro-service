import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  @Get('auth/test')
  async testAuth() {
    return firstValueFrom(
      this.authClient.send(
        { cmd: 'auth_test' },
        {},
      ),
    );
  }

  

  @Post('auth/register')
  async register(
    @Body()
    body: {
      phoneNumber: string;
      email?: string;
      userType: string;
      authMethod: string;
    },
  ) {
    return firstValueFrom(
      this.authClient.send(
        { cmd: 'auth_register' },
        body,
      ),
    );
  }
}