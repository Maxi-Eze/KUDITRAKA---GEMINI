import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItem } from '@/lib/types';

interface InventoryRowProps {
  item: InventoryItem;
  onClick: (item: InventoryItem) => void;
}

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= minStock) {
    return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">Low Stock</Badge>;
  }
  return <Badge variant="secondary" className="bg-green-500/10 text-green-500">In Stock</Badge>;
}

export function InventoryRow({ item, onClick }: InventoryRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick(item)}
    >
      <TableCell>
        <span className="font-medium truncate block max-w-[200px]">{item.name}</span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{item.category}</span>
      </TableCell>
      <TableCell>
        <StockBadge stock={item.stock} minStock={item.min_stock} />
      </TableCell>
      <TableCell>
        <span className="font-medium">{formatCurrency(item.selling_price)}</span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{item.stock}</span>
      </TableCell>
    </TableRow>
  );
}