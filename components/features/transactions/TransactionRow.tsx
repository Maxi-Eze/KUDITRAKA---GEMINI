import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatTxDate, cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction, onDelete }: TransactionRowProps) {
  const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;

  return (
    <TableRow>
      <TableCell>
        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
          {transaction.type}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-medium truncate block max-w-[200px]">{transaction.item}</span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">
          {transaction.customer || '—'}
        </span>
      </TableCell>
      <TableCell>
        <span className={cn(
          'font-medium',
          transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'
        )}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(amount)}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{formatTxDate(transaction.date)}</span>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(transaction.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
