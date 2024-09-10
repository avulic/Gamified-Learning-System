import { createClient, RedisClientType } from 'redis';
import { redisConfig } from '../config/redistConfig';

let redisClient: RedisClientType;

const redisAdapter = async () => {
    redisClient = createClient({
        url: redisConfig.url,
        password: redisConfig.password
    });

    redisClient.on('error', (err) => {
        console.log('Redis Client Error', err);
        process.exit(1);
    });

    try {
        await redisClient.connect();
        console.log("Redis connection successful...");
    } catch (error) {
        console.log("Redis connection failed");
        console.log(error);
        process.exit(1);
    }
};

export { redisClient, redisAdapter };