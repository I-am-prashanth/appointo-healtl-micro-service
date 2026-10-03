
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { DatabaseService } from '../database/database.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

@Injectable()
export class PatientService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async createPatient(body: CreatePatientDto) {
    const dto = plainToInstance(CreatePatientDto, body);

    await validateOrReject(dto);

    const pool = this.databaseService.getPool();

    // Check whether this Auth user already has a patient profile.
    const existing = await pool.query(
      `SELECT id FROM patients WHERE user_id = $1`,
      [dto.userId],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException(
        'Patient profile already exists for this user',
      );
    }

    const query = `
      INSERT INTO patients (
        user_id,
        name,
        phone_number,
        email,
        age,
        weight,
        height,
        bp,
        blood_group
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      dto.userId,
      dto.name ?? 'New Patient',
      dto.phoneNumber,
      dto.email ?? null,
      dto.age ?? null,
      dto.weight ?? null,
      dto.height ?? null,
      dto.bp ?? null,
      dto.bloodGroup ?? null,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      // Protect against concurrent requests and unique constraints.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'Patient profile already exists',
        );
      }

      throw error;
    }
  }

  async getPatientByUserId(userId: string) {
    const result = await this.databaseService
      .getPool()
      .query(
        `SELECT * FROM patients WHERE user_id = $1`,
        [userId],
      );

    if (result.rows.length === 0) {
      throw new NotFoundException('Patient not found');
    }

    return result.rows[0];
  }

  async updatePatient(
    userId: string,
    body: UpdatePatientDto,
  ) {
    const dto = plainToInstance(UpdatePatientDto, body);

    await validateOrReject(dto);

    const allowedFields: Record<string, string> = {
      name: 'name',
      email: 'email',
      age: 'age',
      weight: 'weight',
      height: 'height',
      bp: 'bp',
      bloodGroup: 'blood_group',
    };

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const [key, column] of Object.entries(allowedFields)) {
      const value = dto[key as keyof UpdatePatientDto];

      if (value !== undefined) {
        values.push(value);
        updates.push(`${column} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      throw new ConflictException(
        'Provide at least one field to update',
      );
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    const query = `
      UPDATE patients
      SET ${updates.join(', ')}
      WHERE user_id = $${values.length}
      RETURNING *;
    `;

    const result = await this.databaseService
      .getPool()
      .query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException('Patient not found');
    }

    return result.rows[0];
  }
}
