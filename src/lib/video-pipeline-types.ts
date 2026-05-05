/**
 * Pure types and utilities for the video pipeline.
 * Import this instead of video-pipeline-queue.ts to avoid
 * pulling bullmq/ioredis into the client bundle.
 */

export const VIDEO_PIPELINE_QUEUE = 'video-pipeline';

export interface VideoPipelineJob {
  listingId: string;
  images: string[];
  mode: string;
  userId: string;
  renovationStyle: string;
  musicGenre: string;
  listingUrl?: string;
  platform?: VideoPlatform;
  customScript?: string;
  voiceoverEnabled?: boolean;
}

export type VideoPipelineStage = 'scrape' | 'renovate' | 'animate' | 'stitch';

export type VideoPlatform = 'zillow' | 'immobilienscout24' | 'redfin' | 'rightmove' | 'other';

export const RENOVATION_STYLES = [
  'modern', 'luxury', 'minimalist', 'scandinavian',
  'industrial', 'coastal', 'contemporary', 'midcentury',
] as const;

export type RenovationStyle = (typeof RENOVATION_STYLES)[number];

export const MUSIC_GENRES = [
  'cinematic', 'upbeat', 'ambient', 'piano', 'electronic', 'acoustic', 'epic',
] as const;

export type MusicGenre = (typeof MUSIC_GENRES)[number];

export const APIFY_ACTORS: Record<Exclude<VideoPlatform, 'other'>, string> = {
  zillow: 'zillow_scraper',
  immobilienscout24: 'immobilienscout24_scraper',
  redfin: 'redfin_scraper',
  rightmove: 'rightmove_scraper',
};

export function detectPlatform(url: string): VideoPlatform {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('zillow.com')) return 'zillow';
  if (urlLower.includes('immobilienscout24.de')) return 'immobilienscout24';
  if (urlLower.includes('redfin.com')) return 'redfin';
  if (urlLower.includes('rightmove.co.uk')) return 'rightmove';
  return 'other';
}
