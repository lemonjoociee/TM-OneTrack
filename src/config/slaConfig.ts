/**
 * SLA Configuration & Thresholds
 * 
 * Central configuration file for Service Level Agreement (SLA) calculations
 * and compliance reporting used across NOC and OPS dashboards.
 */

export interface SlaThresholdConfig {
  p1ResolutionHours: number;
  p2ResolutionHours: number;
  p3ResolutionHours: number;
  p4ResolutionHours: number;
  nocFirstReplyMinutes: number; // 15-minute response rule for NOC operational queue
  nearBreachPercentageThreshold: number; // e.g. 75% of SLA elapsed is "Near Breach"
}

export const SLA_CONFIG: SlaThresholdConfig = {
  p1ResolutionHours: 2,    // Critical P1 incident SLA: 2 hours resolution
  p2ResolutionHours: 12,   // P2 high priority incident: 12 hours resolution
  p3ResolutionHours: 24,   // P3 medium priority incident: 24 hours resolution
  p4ResolutionHours: 48,   // P4 low priority / standard request: 48 hours resolution
  nocFirstReplyMinutes: 15,// NOC 15-minute response rule for new escalations
  nearBreachPercentageThreshold: 0.75, // When 75% of allowed time has elapsed
};

export type SlaStatusCategory = 'Within SLA' | 'Near SLA Breach' | 'SLA Breached' | 'Unavailable';

/**
 * Calculates SLA category for a ticket based on priority and elapsed time.
 */
export function calculateSlaCategory(
  priority: string | undefined,
  ageHours: number,
  isResolved: boolean
): SlaStatusCategory {
  const pri = (priority || '').toUpperCase();
  let maxHours = SLA_CONFIG.p3ResolutionHours; // default to P3 if unassigned

  if (pri === 'P1') maxHours = SLA_CONFIG.p1ResolutionHours;
  else if (pri === 'P2') maxHours = SLA_CONFIG.p2ResolutionHours;
  else if (pri === 'P3') maxHours = SLA_CONFIG.p3ResolutionHours;
  else if (pri === 'P4') maxHours = SLA_CONFIG.p4ResolutionHours;

  if (ageHours > maxHours) {
    return 'SLA Breached';
  } else if (!isResolved && ageHours >= maxHours * SLA_CONFIG.nearBreachPercentageThreshold) {
    return 'Near SLA Breach';
  }
  return 'Within SLA';
}
