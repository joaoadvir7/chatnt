import { Queue } from "bullmq";
import { redisConnection } from "@/lib/queue/redis-connection";

export type BroadcastJobData = {
  broadcastRecipientId: string;
};

const globalForQueue = globalThis as unknown as { broadcastQueue?: Queue<BroadcastJobData> };

export const broadcastQueue =
  globalForQueue.broadcastQueue ??
  new Queue<BroadcastJobData>("broadcast-sends", { connection: redisConnection });

if (process.env.NODE_ENV !== "production") {
  globalForQueue.broadcastQueue = broadcastQueue;
}
