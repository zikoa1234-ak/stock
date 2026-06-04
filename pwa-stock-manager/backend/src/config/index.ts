import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  
  // Security
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  
  // Default Admin User
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin@stock.com'),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default('Admin@123'),
  DEFAULT_ADMIN_NAME: z.string().default('System Admin'),
});

const config = configSchema.parse(process.env);

export default config;