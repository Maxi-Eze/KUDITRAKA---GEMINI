import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatTxDate, cn } from '@/lib/utils';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface TransactionRowProps {
  transaction: Transaction;
  onView: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction, onView, onEdit, onDelete }: TransactionRowProps) {
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
          {transaction.customer_id || '—'}
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
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onView(transaction)}
            className="text-muted-foreground hover:text-foreground"
            title="View details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(transaction)}
            className="text-muted-foreground hover:text-foreground"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(transaction.id)}
            className="text-muted-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
