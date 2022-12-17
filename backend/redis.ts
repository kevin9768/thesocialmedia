import Redis from 'ioredis';
import 'dotenv-safe';
export const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: 15550,
    password: process.env.REDIS_PASSWORD
});
