// Auth actions - Email/password authentication removed, only OAuth supported

// Connection actions
export {
  validateConnection,
  createConnection,
  updateConnection,
  deleteConnection,
} from "./connection-actions";

// Health check actions
export {
  refreshHealthData,
  createHealthCheck,
  updateHealthCheck,
  deleteHealthCheck,
  triggerHealthCheck,
} from "./health-actions";

// Settings actions
export {
  updateUserProfile,
  enableTwoFactor,
  disableTwoFactor,
  updateNotificationSettings,
  updatePreferences,
  clearData,
  exportData,
  getUserPreferences,
  getNotificationSettings,
} from "./settings-actions";

// Alert actions
export {
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlert,
  getAlerts,
  getAlertById,
  getAlertStats,
  getAlertDashboardData,
  getRecentTriggeredAlerts,
  addAlertHistory,
  getAlertHistory,
  markHistoryAsResolved,
} from "./alert-actions";
