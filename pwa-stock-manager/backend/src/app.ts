import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import config from './config';
import { ErrorMiddleware } from './middleware/error.middleware';
import { createAuthRoutes } from './routes/auth.routes';
import { createUserRoutes } from './routes/user.routes';
import { createCategoryRoutes } from './routes/category.routes';
import { createItemRoutes } from './routes/item.routes';
import { createMovementRoutes } from './routes/movement.routes';
import { createDashboardRoutes } from './routes/dashboard.routes';

class App {
  private app: express.Application;
  private prisma: PrismaClient;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: config.CORS_ORIGIN.split(','),
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX,
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging (in development)
    if (config.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
      });
    }
  }

  private initializeRoutes() {
    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Stock Management API',
        version: '1.0.0',
      });
    });

    // API routes
    this.app.use('/api/auth', createAuthRoutes(this.prisma));
    this.app.use('/api/users', createUserRoutes(this.prisma));
    this.app.use('/api/categories', createCategoryRoutes(this.prisma));
    this.app.use('/api/items', createItemRoutes(this.prisma));
    this.app.use('/api/movements', createMovementRoutes(this.prisma));
    this.app.use('/api/dashboard', createDashboardRoutes(this.prisma));

    // Handle 404
    this.app.use('*', ErrorMiddleware.notFound);
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware.handler);
  }

  public async start() {
    try {
      // Test database connection
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');

      // Start server
      this.app.listen(config.PORT, () => {
        console.log(`🚀 Server running on port ${config.PORT}`);
        console.log(`📁 Environment: ${config.NODE_ENV}`);
        console.log(`🔗 API URL: http://localhost:${config.PORT}/api`);
        console.log(`❤️  Health check: http://localhost:${config.PORT}/api/health`);
      });

      // Handle graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown() {
    console.log('🛑 Shutting down gracefully...');
    
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new App();
app.start();