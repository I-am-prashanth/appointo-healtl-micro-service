import { Injectable } from '@nestjs/common';

// import { DatabaseService } from './database.service.ts';

import { DatabaseService } from './database/database.service.js';

@Injectable()
export class PatientService {

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async createPatient(body: {
    userId: string;
    phoneNumber: string;
    email?: string;
  }) {

    const query = `
      INSERT INTO patients (
        user_id,
        name,
        phone_number,
        email
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const result = await this.databaseService
      .getPool()
      .query(query, [
        body.userId,
        'New Patient',
        body.phoneNumber,
        body.email ?? null,
      ]);

    return result.rows[0];
  }
}