import { config } from 'dotenv';
import { MotionConfig } from './types/motion.js';

config();

export function getConfig(): MotionConfig {
  const apiKey = process.env.MOTION_API_KEY;
  if (!apiKey) {
    throw new Error('MOTION_API_KEY environment variable is required');
  }

  return {
    apiKey,
    baseUrl: process.env.MOTION_API_BASE_URL || 'https://api.usemotion.com/v1',
    rateLimitPerMinute: parseInt(process.env.MOTION_RATE_LIMIT_PER_MINUTE || '12', 10),
  };
}
