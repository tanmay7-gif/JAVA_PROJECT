import { ActivityService } from '../services/activity.service.js';

/**
 * Universal audit logging helper that records actions to the database.
 * Delegates to ActivityService for clean architecture.
 */
export async function logAudit(
  userId: string | null,
  action: string,
  details?: Record<string, any> | string
): Promise<void> {
  return ActivityService.log(userId, action, details);
}
