"use client";

import { useEffect } from "react";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { log } from "@/lib/shared/utils/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error("Global error:", error.message);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Something went wrong!
                </h1>
                <p className="text-muted-foreground">
                  We encountered an unexpected error. Please try refreshing the
                  page.
                </p>
              </div>

              {error.digest && (
                <div className="text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </div>
              )}

              <Button onClick={reset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
