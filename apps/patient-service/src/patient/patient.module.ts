
import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller.js';
import { PatientService } from './patient.service.js';
import { DatabaseModule } from '../database/databse.modules.js';

@Module({
  imports: [DatabaseModule],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
