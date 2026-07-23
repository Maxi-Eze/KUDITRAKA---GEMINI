import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItem } from '@/lib/types';

interface InventoryCardProps {
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

export function InventoryCard({ item, onClick }: InventoryCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onClick(item)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs text-muted-foreground">{item.category}</span>
          <StockBadge stock={item.stock} minStock={item.minStock} />
        </div>
        <p className="text-sm font-medium truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium">{formatCurrency(item.sellingPrice)}</span>
          <span className="text-xs text-muted-foreground">Stock: {item.stock}</span>
        </div>
      </CardContent>
    </Card>
  );
}