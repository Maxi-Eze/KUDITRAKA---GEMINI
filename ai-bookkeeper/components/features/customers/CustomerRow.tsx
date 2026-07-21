import { TableRow, TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { CustomerData } from '@/lib/types';

interface CustomerRowProps {
  customer: CustomerData;
  rank: number;
  onClick: (customer: CustomerData) => void;
}

export function CustomerRow({ customer, rank, onClick }: CustomerRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick(customer)}
    >
      <TableCell>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {rank}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-medium truncate block max-w-[200px]">{customer.name}</span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">
          {customer.count} transaction{customer.count !== 1 ? 's' : ''}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-medium">{formatCurrency(customer.total)}</span>
      </TableCell>
    </TableRow>
  );
}
