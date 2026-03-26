// BullMQ Queue Configuration for Background Jobs
// Handles syndication, video processing, and other long-running tasks
// NOTE: Redis connection is lazy-loaded to avoid build-time errors

import { Queue } from 'bullmq';

// Queue names
export const QUEUES = {
  SYNDICATION: 'syndication',
  VIDEO: 'video-processing',
  STAGING: 'virtual-staging',
} as const;

// Job types
export interface SyndicationJob {
  listingId: string;
  agentId: string;
  portalName: string;
  syndicationLogId: string;
  retryCount?: number;
}

export interface VideoJob {
  jobId: string;
  userId: string;
  imageUrls: string[];
  style: string;
}

export interface StagingJob {
  jobId: string;
  userId: string;
  imageUrl: string;
  roomType: string;
  style: string;
}

// Lazy-load Redis connection to avoid build errors
function getRedisConnection() {
  const Redis = require('ioredis');
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    lazyConnect: true, // Don't connect immediately
  });
}

// Lazy-load queues to avoid connecting to Redis during build
let _syndicationQueue: Queue<SyndicationJob> | null = null;
let _videoQueue: Queue<VideoJob> | null = null;
let _stagingQueue: Queue<StagingJob> | null = null;

export const syndicationQueue = {
  get instance() {
    if (!_syndicationQueue) {
      _syndicationQueue = new Queue<SyndicationJob>(QUEUES.SYNDICATION, {
        connection: getRedisConnection(),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      });
    }
    return _syndicationQueue;
  },
};

export const videoQueue = {
  get instance() {
    if (!_videoQueue) {
      _videoQueue = new Queue<VideoJob>(QUEUES.VIDEO, {
        connection: getRedisConnection(),
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
          removeOnComplete: 50,
          removeOnFail: 25,
        },
      });
    }
    return _videoQueue;
  },
};

export const stagingQueue = {
  get instance() {
    if (!_stagingQueue) {
      _stagingQueue = new Queue<StagingJob>(QUEUES.STAGING, {
        connection: getRedisConnection(),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      });
    }
    return _stagingQueue;
  },
};

// Helper to add syndication job
export async function queueSyndication(job: SyndicationJob) {
  return syndicationQueue.instance.add(`syndicate-${job.portalName}-${job.listingId}`, job, {
    jobId: `synd-${job.syndicationLogId}`,
  });
}

// Helper to add video job
export async function queueVideoProcessing(job: VideoJob) {
  return videoQueue.instance.add(`video-${job.jobId}`, job, {
    jobId: job.jobId,
  });
}

// Helper to add staging job
export async function queueVirtualStaging(job: StagingJob) {
  return stagingQueue.instance.add(`staging-${job.jobId}`, job, {
    jobId: job.jobId,
  });
}
