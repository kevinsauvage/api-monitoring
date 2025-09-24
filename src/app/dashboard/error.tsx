"use client";

import { useEffect } from "react";

import Link from "next/link";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { log } from "@/lib/shared/utils/logger";



export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    log.error("Dashboard error", { error: error.message });
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Dashboard Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We encountered an error while loading the dashboard. This might be a
            temporary issue.
          </p>

          {error.digest && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Error ID: {error.digest}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
