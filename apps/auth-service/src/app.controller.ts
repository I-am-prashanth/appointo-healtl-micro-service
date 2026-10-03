import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  MessagePattern,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './app.service.js';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    @Inject('PATIENT_SERVICE')
    private readonly patientClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'auth_test' })
  async testAuth() {
    return {
      message: 'Auth service is working',
    };
  }

  @MessagePattern({ cmd: 'auth_register' })
  async register(body: {
    phoneNumber: string;
    email?: string;
    userType: string;
    authMethod: string;
  }) {
    try {
      // 1. Check whether user already exists
      const existingUser = await this.authService.checkUser(body.phoneNumber);

if (existingUser) {
  return {
    success: false,
    status: 409,
    message: 'Phone number already registered',
  };
}

if (body.email) {
  const existingEmail = await this.authService.checkEmail(body.email);

  if (existingEmail) {
    return {
      success: false,
      status: 409,
      message: 'Email already registered',
    };
  }
}

      
      

      // 2. Create user in Auth DB
      const user = await this.authService.createUser(
        body.phoneNumber,
        body.email ?? null,
        body.userType,
        body.authMethod,
      );

      // 3. If user is PATIENT,
      //    call Patient Service
      if (body.userType === 'PATIENT') {
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

        // 4. Both Auth DB and Patient DB succeeded
        return {
          success: true,
          status: 201,
          message: 'User and patient registered successfully',
          data: {
            user,
            patient,
          },
        };
      }

      // 5. If not a patient
      return {
        success: true,
        status: 201,
        message: 'User registered successfully',
        data: user,
      };

    } catch (err) {
      console.error('Registration error:', err);

      return {
        success: false,
        status: 500,
        message: 'Internal server error',
      };
    }
  }
}