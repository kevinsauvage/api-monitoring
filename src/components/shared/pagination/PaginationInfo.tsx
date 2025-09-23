import { Badge } from "@/components/ui/badge";

export default function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  filteredCount,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  filteredCount?: number;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const isFiltered =
    filteredCount !== undefined && filteredCount !== totalItems;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {startItem}-{endItem}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {isFiltered ? filteredCount : totalItems}
          </span>{" "}
          results
        </div>

        {isFiltered && (
          <Badge variant="outline" className="text-xs">
            {totalItems - filteredCount} hidden by filters
          </Badge>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
