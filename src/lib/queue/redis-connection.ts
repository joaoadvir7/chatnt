import IORedis from "ioredis";

const globalForRedis = globalThis as unknown as { redisConnection?: IORedis };

export const redisConnection =
  globalForRedis.redisConnection ??
  new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null, // exigido pelo BullMQ
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisConnection = redisConnection;
}
