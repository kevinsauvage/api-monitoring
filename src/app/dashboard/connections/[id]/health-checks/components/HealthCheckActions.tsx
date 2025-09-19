"use client";

import { useState } from "react";
import { Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  deleteHealthCheck,
  toggleHealthCheckActive,
  triggerHealthCheck,
} from "@/actions/health-actions";
import { log } from "@/lib/logger";

interface HealthCheckActionsProps {
  healthCheckId: string;
  isActive: boolean;
}

export default function HealthCheckActions({
  healthCheckId,
  isActive,
}: HealthCheckActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteHealthCheck(healthCheckId);

      if (result.success) {
        toast.success("Health check deleted successfully");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error ?? "Failed to delete health check");
      }
    } catch (error) {
      log.error("Failed to delete health check", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to delete health check");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setIsToggling(true);
      const result = await toggleHealthCheckActive(healthCheckId, isActive);

      if (result.success) {
        toast.success(
          `Health check ${!isActive ? "activated" : "deactivated"}`
        );
      } else {
        toast.error(result.error ?? "Failed to toggle health check");
      }
    } catch (error) {
      log.error("Failed to toggle health check", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to toggle health check");
    } finally {
      setIsToggling(false);
    }
  };

  const handleTrigger = async () => {
    try {
      setIsTriggering(true);
      const result = await triggerHealthCheck(healthCheckId);

      if (result.success) {
        toast.success("Health check triggered successfully");
      } else {
        toast.error(result.error ?? "Failed to trigger health check");
      }
    } catch (error) {
      log.error("Failed to trigger health check", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to trigger health check");
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleTrigger()}
          disabled={isTriggering}
        >
          <Play className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleToggleActive()}
          disabled={isToggling}
        >
          {isActive ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Health Check</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this health check? This action
              cannot be undone and will also delete all associated check
              results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
