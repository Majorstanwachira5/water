/**
 * Worker Service: Handles asynchronous tasks, background queues, and scheduled pricing tasks.
 */

console.log('[worker-service] Initializing background event worker...');

interface Job {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: string;
}

const jobQueue: Job[] = [];

export function enqueueJob(type: string, payload: any) {
  const job: Job = {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    status: 'pending',
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
  };
  jobQueue.push(job);
  console.log(`[worker-service] Enqueued job: ${job.type} (${job.id})`);
}

async function processJob(job: Job) {
  job.status = 'running';
  job.attempts++;
  console.log(`[worker-service] Processing ${job.type} (attempt ${job.attempts})`);

  try {
    switch (job.type) {
      case 'INVALIDATE_CATALOG_CACHE':
        // Notify API Gateway to invalidate cached product aggregation
        console.log('[worker-service] Invalidating API Gateway public catalogue cache');
        break;
      case 'IMAGE_OPTIMIZATION':
        console.log(`[worker-service] Optimizing image asset: ${job.payload.fileName}`);
        break;
      case 'SCHEDULED_PRICE_PUBLISH':
        console.log(`[worker-service] Publishing scheduled price for product: ${job.payload.productId}`);
        break;
      default:
        console.log(`[worker-service] Handled generic task: ${job.type}`);
    }
    job.status = 'completed';
  } catch (err: any) {
    console.error(`[worker-service] Job ${job.id} failed:`, err.message);
    if (job.attempts >= job.maxAttempts) {
      job.status = 'failed';
    } else {
      job.status = 'pending';
    }
  }
}

// Background poll loop
setInterval(async () => {
  const nextJob = jobQueue.find((j) => j.status === 'pending');
  if (nextJob) {
    await processJob(nextJob);
  }
}, 3000);

console.log('[worker-service] Background worker active and listening for events.');
