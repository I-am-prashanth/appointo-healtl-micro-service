import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

// import { PatientService } from './patient.service.js';
import { PatientService } from './app.controller.spec.js';

@Controller()
export class PatientController {

  constructor(
    private readonly patientService: PatientService,
  ) {}

  @MessagePattern({ cmd: 'patient_create' })
  async createPatient(body: {
    userId: string;
    phoneNumber: string;
    email?: string;
  }) {
    return this.patientService.createPatient(body);
  }
}