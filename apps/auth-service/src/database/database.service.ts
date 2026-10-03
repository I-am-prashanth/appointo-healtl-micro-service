import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async onModuleInit() {
    try {
      const result = await this.pool.query('SELECT NOW()');

      console.log('✅ Neon PostgreSQL connected');
      console.log('Database time:', result.rows[0].now);
    } catch (error) {
      console.error('❌ Neon PostgreSQL connection failed');
      console.error(error);
    }
  }

  async testConnection() {
    const result = await this.pool.query('SELECT NOW()');
    return result.rows[0];
  }

  getPool() {
    return this.pool;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}