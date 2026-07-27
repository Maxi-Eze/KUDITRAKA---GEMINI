import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { CustomerData } from '@/lib/types';

interface CustomerCardProps {
  customer: CustomerData;
  rank: number;
  onClick: (customer: CustomerData) => void;
}

export function CustomerCard({ customer, rank, onClick }: CustomerCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onClick(customer)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {rank}
          </span>
        </div>
        <p className="text-sm font-medium truncate">{customer.name}</p>
        <p className="text-xs text-muted-foreground">
          {customer.count} transaction{customer.count !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium">{formatCurrency(customer.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
