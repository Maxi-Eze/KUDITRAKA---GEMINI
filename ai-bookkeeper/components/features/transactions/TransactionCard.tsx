import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatTxDate, cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionCard({ transaction, onDelete }: TransactionCardProps) {
  const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
            {transaction.type}
          </Badge>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(transaction.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-sm font-medium">{transaction.item}</p>
        {transaction.customer && (
          <p className="text-xs text-muted-foreground">{transaction.customer}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className={cn(
            'text-sm font-medium',
            transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'
          )}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(amount)}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {transaction.payment_method}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatTxDate(transaction.date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
