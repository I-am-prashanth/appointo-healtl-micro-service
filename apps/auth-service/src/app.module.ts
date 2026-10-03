import { Module } from '@nestjs/common';
import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

import { AuthService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthController } from './app.controller.js';

@Module({
  imports: [
    DatabaseModule,

    ClientsModule.register([
      {
        name: 'PATIENT_SERVICE',

        transport: Transport.TCP,

        options: {
          host: '127.0.0.1',
          port: 4002,
        },
      },
    ]),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
  ],
})
export class AppModule {}