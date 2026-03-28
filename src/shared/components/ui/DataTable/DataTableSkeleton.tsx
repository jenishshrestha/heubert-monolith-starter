import { Skeleton } from "@shared/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/Table";
import { cn } from "@shared/lib/utils";

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  showHeader?: boolean;
  className?: string;
}

function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  showHeader = true,
  className,
}: DataTableSkeletonProps) {
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-5 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-5 w-full max-w-[200px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export type { DataTableSkeletonProps };
export { DataTableSkeleton };
