
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { PatientService } from './patient.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

@Controller()
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
  ) {}

  @MessagePattern({ cmd: 'patient_create' })
  async createPatient(body: CreatePatientDto) {
    return this.patientService.createPatient(body);
  }

  @MessagePattern({ cmd: 'patient_get_by_user_id' })
  async getPatient(body: { userId: string }) {
    return this.patientService.getPatientByUserId(
      body.userId,
    );
  }

  @MessagePattern({ cmd: 'patient_update' })
  async updatePatient(body: {
    userId: string;
    data: UpdatePatientDto;
  }) {
    return this.patientService.updatePatient(
      body.userId,
      body.data,
    );
  }
}
