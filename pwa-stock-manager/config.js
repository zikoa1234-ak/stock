// Configuration for Stock Manager API
module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-manager',

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'stock-manager-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:8080'],

  // Security
  passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10,

  // API Rate Limiting
  apiRateLimit: parseInt(process.env.API_RATE_LIMIT) || 60
};