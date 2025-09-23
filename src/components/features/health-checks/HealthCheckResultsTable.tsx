"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { Clock } from "lucide-react";
import { formatTimestamp, formatResponseTime } from "@/lib/shared/utils/utils";
import { StatusBadge, MethodBadge } from "@/components/shared";
import { getStatusIcon } from "@/lib/shared/utils";
import type { SerializedCheckResultWithDetails } from "@/lib/core/serializers";

export type SortField = "timestamp" | "status" | "responseTime" | "statusCode";
export type SortDirection = "asc" | "desc";

export default function HealthCheckResultsTable({
  results,
  currentPage: _currentPage = 1,
  totalPages: _totalPages = 1,
  totalCount: _totalCount = 0,
  itemsPerPage: _itemsPerPage = 20,
  statusFilter: initialStatusFilter = "all",
  searchTerm: initialSearchTerm = "",
  searchParameters: _searchParameters = {},
}: {
  results: SerializedCheckResultWithDetails[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  itemsPerPage?: number;
  statusFilter?: string;
  searchTerm?: string;
  searchParameters?: {
    page?: string;
    status?: string;
    search?: string;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setStatusFilter(initialStatusFilter);
  }, [initialSearchTerm, initialStatusFilter]);

  const updateFilters = useCallback(
    (newSearchTerm: string, newStatusFilter: string) => {
      const params = new URLSearchParams(searchParams.toString());

      params.delete("page");

      if (newSearchTerm) {
        params.set("search", newSearchTerm);
      } else {
        params.delete("search");
      }

      if (newStatusFilter !== "all") {
        params.set("status", newStatusFilter);
      } else {
        params.delete("status");
      }

      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [searchParams, router, pathname]
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters(searchTerm, statusFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, updateFilters]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    updateFilters(searchTerm, value);
  };

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
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
  }, [results, sortField, sortDirection]);

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
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by status, status code, or error message..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
              {results.length > 0 && (
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
            {sortedResults.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={results.length > 0 ? 6 : 5}
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
              sortedResults.map((result) => (
                <TableRow
                  key={result.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(result.status)}
                      </div>
                      <StatusBadge status={result.status} variant="extended" />
                    </div>
                  </TableCell>
                  {results.length > 0 && (
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MethodBadge
                            method={result.healthCheck.method}
                            className="text-xs font-mono"
                          />
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
    </div>
  );
}
