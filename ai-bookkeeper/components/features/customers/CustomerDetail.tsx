import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTxDate, cn } from '@/lib/utils';
import type { CustomerData } from '@/lib/types';

interface CustomerDetailProps {
  customer: CustomerData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetail({ customer, open, onOpenChange }: CustomerDetailProps) {
  if (!customer) return null;

  const recentTransactions = [...customer.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-medium">{customer.count}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-medium">{formatCurrency(customer.total)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-lg font-medium text-emerald-500">{formatCurrency(customer.income)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Expense</p>
              <p className="text-lg font-medium text-red-500">{formatCurrency(customer.expense)}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Transactions</h4>
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.item}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={tx.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                        {tx.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatTxDate(tx.date)}</span>
                    </div>
                  </div>
                  <span className={cn(
                    'text-sm font-medium shrink-0 ml-2',
                    tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
