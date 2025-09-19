import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
  apiConnectionId: string;
}

export default function FormHeader({ apiConnectionId }: FormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/dashboard/connections/${apiConnectionId}/health-checks`}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Health Check
          </h1>
          <p className="text-muted-foreground">
            Set up automated monitoring for your API endpoint
          </p>
        </div>
      </div>
    </div>
  );
}
