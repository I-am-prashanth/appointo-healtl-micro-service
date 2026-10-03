import {
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  ClientProxy,
} from '@nestjs/microservices';

import {
  firstValueFrom,
} from 'rxjs';

import { DatabaseService } from './database/database.service.js';

@Injectable()
export class AuthService {

  constructor(
    private readonly databaseService: DatabaseService,

    @Inject('PATIENT_SERVICE')
    private readonly patientClient: ClientProxy,
  ) {}

  async checkUser(number: string) {
  const query = `
    SELECT id FROM users
    WHERE phone_number = $1
  `;

  const result = await this.databaseService
    .getPool()
    .query(query, [number]);

  return result.rows[0] ?? null;
}

async checkEmail(email: string) {
  const query = `
    SELECT id FROM users
    WHERE email = $1
  `;

  const result = await this.databaseService
    .getPool()
    .query(query, [email]);

  return result.rows[0] ?? null;
}



  async createUser(
    phoneNumber: string,
    email: string | null,
    userType: string,
    authMethod: string,
  ) {

    const query = `
      INSERT INTO users (
        phone_number,
        email,
        user_type,
        auth_method
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        phone_number,
        email,
        user_type,
        auth_method;
    `;

    const values = [
      phoneNumber,
      email,
      userType,
      authMethod,
    ];

    const result = await this.databaseService
      .getPool()
      .query(query, values);

    return result.rows[0];
  }


  async register(
    phoneNumber: string,
    email: string | null,
    userType: string,
    authMethod: string,
  ) {

    // STEP 1: Check whether user already exists

    const existingUser = await this.checkUser(
      phoneNumber,
    );

    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
      };
    }


    // STEP 2: Create user in Auth DB

    const user = await this.createUser(
      phoneNumber,
      email,
      userType,
      authMethod,
    );


    // STEP 3: If user is a patient,
    // call Patient Service

    if (userType === 'PATIENT') {

      const patient = await firstValueFrom(
        this.patientClient.send(
          { cmd: 'patient_create' },
          {
            userId: user.id,
            phoneNumber: user.phone_number,
            email: user.email,
          },
        ),
      );


      // STEP 4: Return success

      return {
        success: true,
        message: 'Registration successful',
        user,
        patient,
      };
    }


    // For non-patient users

    return {
      success: true,
      message: 'User created successfully',
      user,
    };
  }
}