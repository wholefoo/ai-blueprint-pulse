import { storage } from "./storage";
import type { NexusResearchJob, NexusJobStatus } from "@shared/schema";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const STATUS_PROGRESS: Record<NexusJobStatus, number> = {
  queued: 0,
  sending: 10,
  researching: 30,
  analyzing: 60,
  generating: 80,
  completed: 100,
  failed: 0,
  capacity: 0,
};

const STATUS_MESSAGES: Record<NexusJobStatus, string> = {
  queued: "Job queued, preparing to send...",
  sending: "Connecting to research engine...",
  researching: "Gathering market intelligence...",
  analyzing: "Analyzing business landscape...",
  generating: "Generating research report...",
  completed: "Research complete!",
  failed: "Research failed. Please try again.",
  capacity: "System at capacity. Please try again later.",
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateJobStatus(
  jobId: number,
  status: NexusJobStatus,
  extra?: Partial<NexusResearchJob>
): Promise<NexusResearchJob | undefined> {
  return storage.updateNexusJob(jobId, {
    status,
    progress: STATUS_PROGRESS[status],
    statusMessage: STATUS_MESSAGES[status],
    ...extra,
  });
}

export async function submitNexusResearch(
  userId: string,
  businessIdea: string,
  sector?: string
): Promise<NexusResearchJob> {
  const job = await storage.createNexusJob({
    userId,
    businessIdea,
    sector: sector || null,
    status: "queued",
    progress: 0,
    statusMessage: STATUS_MESSAGES.queued,
    retryCount: 0,
    webhookResponse: null,
    resultData: null,
    errorMessage: null,
  });

  sendToN8n(job.id, businessIdea, sector).catch((err) => {
    console.error(`[Nexus] Background send failed for job ${job.id}:`, err);
  });

  return job;
}

async function sendToN8n(
  jobId: number,
  businessIdea: string,
  sector?: string
): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!webhookUrl) {
    await updateJobStatus(jobId, "failed", {
      errorMessage: "Webhook URL not configured",
    });
    return;
  }

  await updateJobStatus(jobId, "sending");

  let lastError: string = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const currentJob = await storage.getNexusJob(jobId);
      if (!currentJob) return;

      await storage.updateNexusJob(jobId, { retryCount: attempt });

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          jobId,
          businessIdea,
          sector: sector || "General",
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        let responseBody = "";
        try {
          responseBody = await response.text();
        } catch {
          responseBody = "";
        }

        await updateJobStatus(jobId, "researching", {
          webhookResponse: responseBody,
        });

        console.log(`[Nexus] Job ${jobId} sent successfully on attempt ${attempt}`);
        return;
      }

      const statusCode = response.status;
      lastError = `HTTP ${statusCode}`;

      try {
        const errorText = await response.text();
        if (errorText) lastError += `: ${errorText.slice(0, 200)}`;
      } catch {}

      if (statusCode === 502 || statusCode === 504) {
        console.warn(
          `[Nexus] Job ${jobId} attempt ${attempt}/${MAX_RETRIES} got ${statusCode}, retrying...`
        );

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }

        await updateJobStatus(jobId, "capacity", {
          errorMessage: `System at capacity after ${MAX_RETRIES} attempts (${lastError})`,
        });
        console.error(`[Nexus] Job ${jobId} exhausted retries - system at capacity`);
        return;
      }

      await updateJobStatus(jobId, "failed", {
        errorMessage: `Webhook returned ${lastError}`,
      });
      return;
    } catch (err: any) {
      lastError = err.message || "Network error";
      console.error(
        `[Nexus] Job ${jobId} attempt ${attempt}/${MAX_RETRIES} network error:`,
        lastError
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      await updateJobStatus(jobId, "capacity", {
        errorMessage: `Network failure after ${MAX_RETRIES} attempts: ${lastError}`,
      });
      return;
    }
  }
}

export async function handleNexusCallback(
  jobId: number,
  status: NexusJobStatus,
  data?: string
): Promise<NexusResearchJob | undefined> {
  const job = await storage.getNexusJob(jobId);
  if (!job) return undefined;

  const updates: Partial<NexusResearchJob> = {
    status,
    progress: STATUS_PROGRESS[status],
    statusMessage: STATUS_MESSAGES[status],
  };

  if (data) {
    updates.resultData = data;
  }

  if (status === "completed") {
    updates.completedAt = new Date();
  }

  return storage.updateNexusJob(jobId, updates);
}

export async function getNexusJobStatus(
  jobId: number
): Promise<NexusResearchJob | undefined> {
  return storage.getNexusJob(jobId);
}

export async function getUserNexusJobs(
  userId: string
): Promise<NexusResearchJob[]> {
  return storage.getNexusJobs(userId);
}
