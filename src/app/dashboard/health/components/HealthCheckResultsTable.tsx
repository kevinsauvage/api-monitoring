"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, Filter, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { formatTimestamp, formatResponseTime } from "@/lib/shared/utils/utils";
import type { SortField, SortDirection } from "@/lib/shared/types";
import type { SerializedCheckResultWithDetails } from "@/lib/core/serializers";

export interface HealthCheckResultsTableProps {
  results: SerializedCheckResultWithDetails[];
}

export default function HealthCheckResultsTable({
  results,
}: HealthCheckResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700";
      case "FAILURE":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700";
      case "TIMEOUT":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700";
      case "ERROR":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        );
      case "FAILURE":
      case "ERROR":
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "TIMEOUT":
        return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return (
          <AlertTriangle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        );
    }
  };

  const filteredAndSortedResults = useMemo(() => {
    let filtered = results;

    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (result.statusCode?.toString().includes(searchTerm) ?? false) ||
          (result.errorMessage
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((result) => result.status === statusFilter);
    }

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "timestamp":
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "responseTime":
          aValue = a.responseTime;
          bValue = b.responseTime;
          break;
        case "statusCode":
          aValue = a.statusCode ?? 0;
          bValue = b.statusCode ?? 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [results, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return (
      <ArrowUpDown
        className={`w-4 h-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by status, status code, or error message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-background">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="FAILURE">Failure</SelectItem>
            <SelectItem value="TIMEOUT">Timeout</SelectItem>
            <SelectItem value="ERROR">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50">
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("status")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Status {getSortIcon("status")}
                </Button>
              </TableHead>
              {results.some((r) => r.healthCheck) && (
                <TableHead className="font-semibold">Endpoint</TableHead>
              )}
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("statusCode")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Status Code {getSortIcon("statusCode")}
                </Button>
              </TableHead>
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("responseTime")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Response Time {getSortIcon("responseTime")}
                </Button>
              </TableHead>
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("timestamp")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Timestamp {getSortIcon("timestamp")}
                </Button>
              </TableHead>
              <TableHead className="font-semibold">Error Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedResults.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={results.some((r) => r.healthCheck) ? 6 : 5}
                  className="text-center py-8"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Filter className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No results found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedResults.map((result) => (
                <TableRow
                  key={result.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(result.status)}
                      </div>
                      <Badge
                        className={`${getStatusColor(
                          result.status
                        )} font-medium`}
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </TableCell>
                  {results.some((r) => r.healthCheck) && (
                    <TableCell className="py-4">
                      {result.healthCheck ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {result.healthCheck.method}
                            </Badge>
                            <span className="font-medium text-foreground truncate">
                              {result.healthCheck.endpoint}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {result.healthCheck.apiConnection.name}
                            {result.healthCheck.apiConnection.provider && (
                              <span className="ml-1 text-xs">
                                ({result.healthCheck.apiConnection.provider})
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="py-4">
                    <Badge
                      variant={
                        result.statusCode &&
                        result.statusCode >= 200 &&
                        result.statusCode < 300
                          ? "default"
                          : "destructive"
                      }
                      className="font-mono text-xs"
                    >
                      {result.statusCode ?? "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-sm">
                        {formatResponseTime(result.responseTime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(result.timestamp)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    {result.errorMessage ? (
                      <div className="max-w-xs">
                        <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md block truncate dark:text-red-300 dark:bg-red-950 dark:border-red-700">
                          {result.errorMessage}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredAndSortedResults.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{results.length}</span>{" "}
          results
        </div>
        {filteredAndSortedResults.length !== results.length && (
          <div className="text-xs text-muted-foreground">
            {results.length - filteredAndSortedResults.length} hidden by filters
          </div>
        )}
      </div>
    </div>
  );
}
