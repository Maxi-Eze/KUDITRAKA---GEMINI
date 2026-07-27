import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { Check, Pencil, X } from 'lucide-react';
import type { ParsedTransaction } from '@/lib/types';

interface ParsedCardProps {
  parsed: ParsedTransaction;
  onConfirm: () => void;
  onEdit: () => void;
  onDiscard: () => void;
  isConfirming?: boolean;
}

export function ParsedCard({ parsed, onConfirm, onEdit, onDiscard, isConfirming }: ParsedCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={parsed.type === 'income' ? 'default' : 'destructive'}>
          {parsed.type}
        </Badge>
        <span className="text-sm text-muted-foreground">Transaction Parsed</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className={cn(
            'font-medium',
            parsed.type === 'income' ? 'text-emerald-500' : 'text-red-500'
          )}>
            {formatCurrency(parsed.amount)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Item</span>
          <span className="font-medium">{parsed.item}</span>
        </div>

        {parsed.quantity && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <span className="font-medium">{parsed.quantity}</span>
          </div>
        )}

        {parsed.customer && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Customer</span>
            <span className="font-medium">{parsed.customer}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Payment</span>
          <span className="font-medium capitalize">{parsed.payment_method}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex-1"
        >
          <Check className="h-4 w-4" />
          Confirm
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          disabled={isConfirming}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDiscard}
          disabled={isConfirming}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
          Discard
        </Button>
      </div>
    </div>
  );
}