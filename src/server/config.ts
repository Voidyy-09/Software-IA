export const config = {
  port: Number(process.env.PORT) || 3001,
  dbUrl: process.env.DATABASE_URL || 'file:./dev.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  wsPath: '/ws',
};
