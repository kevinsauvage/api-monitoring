"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Play, Pause } from "lucide-react";
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
import { log } from "@/lib/shared/utils/logger";
import {
  toggleConnectionActive,
  deleteConnection,
} from "@/actions/connection-actions";

interface ConnectionActionsProps {
  connection: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export default function ConnectionActions({
  connection,
}: ConnectionActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleActive = async () => {
    try {
      setIsLoading(true);
      const result = await toggleConnectionActive(
        connection.id,
        connection.isActive
      );

      if (result.success) {
        toast.success(result.message);
        // Data will be automatically refreshed by revalidatePath in the server action
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      log.error(
        "Failed to toggle connection:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Failed to update connection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const result = await deleteConnection(connection.id);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/connections");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      log.error(
        "Failed to delete connection:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Failed to delete connection");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => void handleToggleActive()}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {connection.isActive ? (
            <Pause className="w-4 h-4 mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {connection.isActive ? "Pause" : "Resume"}
        </Button>

        <Button
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{connection.name}&quot;?
              This action cannot be undone and will also delete all associated
              health checks and their history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
