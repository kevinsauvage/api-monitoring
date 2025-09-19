import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  apiConnectionId: string;
}

export default function FormActions({
  isSubmitting,
  apiConnectionId,
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-4 pt-6">
      <Button variant="outline" asChild className="h-11 px-8">
        <Link href={`/dashboard/connections/${apiConnectionId}/health-checks`}>
          Cancel
        </Link>
      </Button>
      <Button type="submit" disabled={isSubmitting} className="h-11 px-8">
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Creating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Create Health Check
          </>
        )}
      </Button>
    </div>
  );
}
