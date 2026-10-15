/**
 * Operations Health Configuration & Thresholds
 * 
 * Rules for evaluating operational stability for the executive OPS Dashboard.
 * These thresholds can be adjusted as operational requirements evolve.
 */

export interface OperationsHealthRules {
  criticalOpenRatio: number;      // e.g. > 0.40 (40% of issues open) -> CRITICAL
  attentionOpenRatio: number;     // e.g. > 0.25 (25% of issues open) -> ATTENTION NEEDED
  criticalSlaCompliance: number;  // e.g. < 80% -> CRITICAL
  attentionSlaCompliance: number; // e.g. < 90% -> ATTENTION NEEDED
  maxCriticalOpenP1: number;      // e.g. >= 2 open P1 issues -> CRITICAL
}

export const OPERATIONS_HEALTH_CONFIG: OperationsHealthRules = {
  criticalOpenRatio: 0.40,
  attentionOpenRatio: 0.25,
  criticalSlaCompliance: 80,
  attentionSlaCompliance: 90,
  maxCriticalOpenP1: 2,
};

export interface HealthEvaluationResult {
  status: 'HEALTHY' | 'ATTENTION NEEDED' | 'CRITICAL';
  reason: string;
}

export function evaluateOperationsHealth(params: {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  slaComplianceRate: number;
  openP1Count?: number;
  hasPreviousPeriodData?: boolean;
  openIssueDeltaPercent?: number; // comparison with previous period
}): HealthEvaluationResult {
  const {
    totalIssues,
    openIssues,
    slaComplianceRate,
    openP1Count = 0,
    openIssueDeltaPercent = 0
  } = params;

  if (totalIssues === 0) {
    return {
      status: 'HEALTHY',
      reason: 'No issue volume recorded for this period.'
    };
  }

  const openRatio = openIssues / totalIssues;

  // 1. Critical conditions
  if (openP1Count >= OPERATIONS_HEALTH_CONFIG.maxCriticalOpenP1) {
    return {
      status: 'CRITICAL',
      reason: `${openP1Count} critical P1 issues are currently open or have breached SLA.`
    };
  }

  if (slaComplianceRate < OPERATIONS_HEALTH_CONFIG.criticalSlaCompliance) {
    return {
      status: 'CRITICAL',
      reason: `SLA compliance rate is critically low at ${Math.round(slaComplianceRate)}% (below ${OPERATIONS_HEALTH_CONFIG.criticalSlaCompliance}% target).`
    };
  }

  if (openRatio > OPERATIONS_HEALTH_CONFIG.criticalOpenRatio) {
    return {
      status: 'CRITICAL',
      reason: `High backlog: ${(openRatio * 100).toFixed(1)}% of reported issues remain unresolved.`
    };
  }

  // 2. Attention Needed conditions
  if (openIssueDeltaPercent > 20) {
    return {
      status: 'ATTENTION NEEDED',
      reason: `Open issues increased by ${openIssueDeltaPercent.toFixed(1)}% compared to the previous period.`
    };
  }

  if (slaComplianceRate < OPERATIONS_HEALTH_CONFIG.attentionSlaCompliance) {
    return {
      status: 'ATTENTION NEEDED',
      reason: `SLA compliance is currently at ${Math.round(slaComplianceRate)}%, requiring operational attention.`
    };
  }

  if (openRatio > OPERATIONS_HEALTH_CONFIG.attentionOpenRatio) {
    return {
      status: 'ATTENTION NEEDED',
      reason: `Open ticket volume is elevated with ${openIssues} active tickets awaiting closure.`
    };
  }

  // 3. Healthy conditions
  return {
    status: 'HEALTHY',
    reason: `Operations nominal: ${Math.round(slaComplianceRate)}% SLA compliance with manageable backlog.`
  };
}
