export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'rally_super_secret_jwt_key_min_32_chars_long_production_ready',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  auth: {
    nonceExpirationMinutes: parseInt(process.env.NONCE_EXPIRATION_MINUTES || '10', 10),
  },
});
