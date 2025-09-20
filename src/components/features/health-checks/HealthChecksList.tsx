"use client";

import { useState } from "react";
import { Plus, Search, Filter, Grid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import HealthCheckCard from "./HealthCheckCard";
import type { HealthCheckWithResults } from "@/lib/core/services/health-check.service";

interface HealthChecksListProps {
  healthChecks: HealthCheckWithResults[];
  connectionName: string;
  connectionId: string;
}

export default function HealthChecksList({
  healthChecks,
  connectionName,
  connectionId,
}: HealthChecksListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter health checks based on search and filters
  const filteredHealthChecks = healthChecks.filter((healthCheck) => {
    const matchesSearch =
      healthCheck.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      healthCheck.method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && healthCheck.isActive) ||
      (statusFilter === "inactive" && !healthCheck.isActive);

    const matchesMethod =
      methodFilter === "all" ||
      healthCheck.method.toLowerCase() === methodFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Get unique methods for filter
  const methods = Array.from(new Set(healthChecks.map((hc) => hc.method)));

  // No recent results to group - using health check data directly

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Health Checks for {connectionName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredHealthChecks.length} of {healthChecks.length} health
              checks
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) =>
              value && setViewMode(value as "grid" | "list")
            }
            variant="outline"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>

      <CardContent>
        {healthChecks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              No health checks configured
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first health check to start monitoring your API
              endpoints.
            </p>
            <Button asChild>
              <a
                href={`/dashboard/connections/${connectionId}/health-checks/new`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Health Check
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search health checks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {methods.map((method) => (
                    <SelectItem key={method} value={method.toLowerCase()}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {(searchTerm ||
              statusFilter !== "all" ||
              methodFilter !== "all") && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setSearchTerm("")}
                  >
                    Search: {searchTerm}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setStatusFilter("all")}
                  >
                    Status: {statusFilter}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {methodFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setMethodFilter("all")}
                  >
                    Method: {methodFilter}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            )}

            {/* Health Checks Display */}
            {filteredHealthChecks.length === 0 ? (
              <div className="text-center py-8">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No health checks found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {filteredHealthChecks.map((healthCheck) => (
                  <HealthCheckCard
                    key={healthCheck.id}
                    healthCheck={healthCheck}
                    connectionName={connectionName}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
