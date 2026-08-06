import { Queue } from "bullmq";
import { redisConnection } from "@/lib/queue/redis-connection";

export type AutomationJobData = {
  runId: string;
  automationId: string;
  contactId: string;
  connectionId: string;
  nodeId: string;
};

const globalForQueue = globalThis as unknown as { automationQueue?: Queue<AutomationJobData> };

export const automationQueue =
  globalForQueue.automationQueue ??
  new Queue<AutomationJobData>("automation-runs", { connection: redisConnection });

if (process.env.NODE_ENV !== "production") {
  globalForQueue.automationQueue = automationQueue;
}
