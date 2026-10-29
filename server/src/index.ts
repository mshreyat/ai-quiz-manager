import { app } from './app';
import { env } from './config/env';
import { prisma, checkDatabaseConnection } from './config/prisma';

const startServer = async () => {
  const isDbConnected = await checkDatabaseConnection();

  console.log('='.repeat(50));
  console.log(`🚀 QuizForge AI Server starting in [${env.NODE_ENV}] mode`);
  console.log(`📡 Port: ${env.PORT}`);
  console.log(`🌐 Allowed Client Origin: ${env.CLIENT_ORIGIN}`);
  console.log(`🗄️ Database Status: ${isDbConnected ? 'CONNECTED' : 'UNREACHABLE (PostgreSQL offline or unconfigured)'}`);
  console.log('='.repeat(50));

  const server = app.listen(env.PORT, () => {
    console.log(`✅ Server is running at http://localhost:${env.PORT}`);
    console.log(`🩺 Health endpoint: http://localhost:${env.PORT}/api/health`);
    console.log(`📋 Quiz API: http://localhost:${env.PORT}/api/quizzes`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('🔌 Disconnected Prisma database client.');
      } catch (err) {
        console.error('Error disconnecting Prisma:', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
