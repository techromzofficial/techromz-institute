/**
 * Analytics Permissions Utilities
 */

export const ANALYTICS_PERMISSIONS = {
  VIEW_ANALYTICS: "analytics.view",
  VIEW_FINANCE: "analytics.finance.view",
  VIEW_CUSTOMER: "analytics.customer.view",
  VIEW_COMPLIANCE: "analytics.compliance.view",
  EXPORT_DASHBOARD: "analytics.export",
  SCHEDULE_REPORT: "analytics.schedule",
  CREATE_REPORT: "analytics.reports.create",
};

export const DEFAULT_USER_PERMISSIONS = [
  ANALYTICS_PERMISSIONS.VIEW_ANALYTICS,
  ANALYTICS_PERMISSIONS.VIEW_FINANCE,
  ANALYTICS_PERMISSIONS.VIEW_CUSTOMER,
  ANALYTICS_PERMISSIONS.VIEW_COMPLIANCE,
  ANALYTICS_PERMISSIONS.EXPORT_DASHBOARD,
  ANALYTICS_PERMISSIONS.SCHEDULE_REPORT,
  ANALYTICS_PERMISSIONS.CREATE_REPORT,
];

/**
 * Checks whether user has the required permission string.
 *
 * @param {string[]} [userPermissions] List of granted permission tokens
 * @param {string} requiredPermission Target permission to check
 * @returns {boolean}
 */
export function hasAnalyticsPermission(userPermissions = DEFAULT_USER_PERMISSIONS, requiredPermission) {
  if (!requiredPermission) return true;
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(requiredPermission);
}

