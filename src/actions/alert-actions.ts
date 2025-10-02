"use server";

import { revalidatePath } from "next/cache";

import { getAlertService } from "@/lib/infrastructure/di/service-factory";
import { alertSchemas } from "@/lib/shared/schemas";
import { createAuthenticatedAction } from "@/lib/shared/utils/action-factory";

import type { AlertType, Prisma } from "@prisma/client";

const alertService = getAlertService();

export const createAlert = createAuthenticatedAction(
  alertSchemas.create,
  async (input, userId) => {
    const data: Prisma.AlertCreateInput = {
      user: { connect: { id: userId } },
      apiConnection: input.apiConnectionId
        ? { connect: { id: input.apiConnectionId } }
        : undefined,
      type: input.type as AlertType,
      condition: input.condition,
      threshold: input.threshold,
      isActive: input.isActive ?? true,
      channels: input.channels,
      webhookUrl: input.webhookUrl,
      slackChannel: input.slackChannel,
    };

    const result = await alertService.createAlert(userId, data);

    revalidatePath("/dashboard/alerts");
    revalidatePath("/dashboard");

    return result;
  },
  ["/dashboard/alerts", "/dashboard"],
  "/dashboard/alerts"
);

export const updateAlert = createAuthenticatedAction(
  alertSchemas.update,
  async (input, userId) => {
    const data: Prisma.AlertUpdateInput = {
      ...(input.apiConnectionId !== undefined && {
        apiConnection: input.apiConnectionId
          ? { connect: { id: input.apiConnectionId } }
          : { disconnect: true },
      }),
      ...(input.type && { type: input.type as AlertType }),
      ...(input.condition && { condition: input.condition }),
      ...(input.threshold !== undefined && { threshold: input.threshold }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.channels && { channels: input.channels }),
      ...(input.webhookUrl !== undefined && { webhookUrl: input.webhookUrl }),
      ...(input.slackChannel !== undefined && {
        slackChannel: input.slackChannel,
      }),
    };

    const result = await alertService.updateAlert(input.id, userId, data);

    revalidatePath("/dashboard/alerts");
    revalidatePath(`/dashboard/alerts/${input.id}`);

    return result;
  },
  ["/dashboard/alerts"]
);

export const deleteAlert = createAuthenticatedAction(
  alertSchemas.delete,
  async (input, userId) => {
    await alertService.deleteAlert(input.id, userId);
    revalidatePath("/dashboard/alerts");
    revalidatePath("/dashboard");
  },
  ["/dashboard/alerts", "/dashboard"]
);

export const toggleAlert = createAuthenticatedAction(
  alertSchemas.toggle,
  async (input, userId) => {
    const result = await alertService.toggleAlert(input.id, userId);
    revalidatePath("/dashboard/alerts");
    return result;
  },
  ["/dashboard/alerts"]
);

export const getAlerts = createAuthenticatedAction(
  alertSchemas.getAlerts,
  async (input, userId) => {
    return alertService.getAlerts(userId, input.filters, input.limit);
  }
);

export const getAlertById = createAuthenticatedAction(
  alertSchemas.getById,
  async (input, userId) => {
    return alertService.getAlertById(input.id, userId);
  }
);

export const getAlertStats = createAuthenticatedAction(
  alertSchemas.emptyInput,
  async (_, userId) => {
    return alertService.getAlertStats(userId);
  }
);

export const getAlertDashboardData = createAuthenticatedAction(
  alertSchemas.emptyInput,
  async (_, userId) => {
    return alertService.getAlertDashboardData(userId);
  }
);

export const getRecentTriggeredAlerts = createAuthenticatedAction(
  alertSchemas.getRecent,
  async (input, userId) => {
    return alertService.getRecentTriggeredAlerts(userId, input.limit);
  }
);

export const addAlertHistory = createAuthenticatedAction(
  alertSchemas.addHistory,
  async (input, _userId) => {
    await alertService.addAlertHistory(
      input.alertId,
      input.message,
      input.severity
    );
    revalidatePath("/dashboard/alerts");
    revalidatePath(`/dashboard/alerts/${input.alertId}`);
  },
  ["/dashboard/alerts"]
);

export const getAlertHistory = createAuthenticatedAction(
  alertSchemas.getHistory,
  async (input, userId) => {
    return alertService.getAlertHistory(input.alertId, userId, input.limit);
  }
);

export const markHistoryAsResolved = createAuthenticatedAction(
  alertSchemas.markResolved,
  async (input, _userId) => {
    await alertService.markHistoryAsResolved(input.historyId, _userId);
    revalidatePath("/dashboard/alerts");
    revalidatePath(`/dashboard/alerts/${input.alertId}`);
  },
  ["/dashboard/alerts"]
);
