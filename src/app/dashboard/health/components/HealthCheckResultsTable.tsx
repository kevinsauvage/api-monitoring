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
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "FAILURE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "TIMEOUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4" />;
      case "FAILURE":
      case "ERROR":
        return <XCircle className="w-4 h-4" />;
      case "TIMEOUT":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
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
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("status")}
                  className="h-auto p-0 font-semibold"
                >
                  Status {getSortIcon("status")}
                </Button>
              </TableHead>
              {results.some((r) => r.healthCheck) && (
                <TableHead>Endpoint</TableHead>
              )}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("statusCode")}
                  className="h-auto p-0 font-semibold"
                >
                  Status Code {getSortIcon("statusCode")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("responseTime")}
                  className="h-auto p-0 font-semibold"
                >
                  Response Time {getSortIcon("responseTime")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("timestamp")}
                  className="h-auto p-0 font-semibold"
                >
                  Timestamp {getSortIcon("timestamp")}
                </Button>
              </TableHead>
              <TableHead>Error Message</TableHead>
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
                <TableRow key={result.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  </TableCell>
                  {results.some((r) => r.healthCheck) && (
                    <TableCell>
                      {result.healthCheck ? (
                        <div>
                          <p className="font-medium text-foreground">
                            {result.healthCheck.method}{" "}
                            {result.healthCheck.endpoint}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {result.healthCheck.apiConnection.name}
                            {result.healthCheck.apiConnection.provider && (
                              <span>
                                {" "}
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
                  <TableCell>
                    <span className="font-mono">
                      {result.statusCode ?? "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">
                      {formatResponseTime(result.responseTime)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatTimestamp(result.timestamp)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {result.errorMessage ? (
                      <span className="text-sm text-destructive max-w-xs truncate block">
                        {result.errorMessage}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedResults.length} of {results.length} results
      </div>
    </div>
  );
}
