// Production Configuration for EasyPanel
module.exports = {
  // Database Configuration
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/stock_management?schema=public',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-this-too',
  
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Default Admin
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@stock.com',
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
  defaultAdminName: process.env.DEFAULT_ADMIN_NAME || 'System Admin'
};