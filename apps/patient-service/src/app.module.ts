
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import { DatabaseModule } from './database/database.module.js';
import { PatientModule } from './patient/patient.module.js';
import { DatabaseModule } from './database/databse.modules.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    PatientModule,
  ],
})
export class AppModule {}
