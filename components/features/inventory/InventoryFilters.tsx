import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

type SortField = 'name' | 'stock' | 'sellingPrice' | 'category';

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortField;
  onSortChange: (value: SortField) => void;
}

export function InventoryFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortField)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name A-Z</SelectItem>
          <SelectItem value="stock">Stock Level</SelectItem>
          <SelectItem value="sellingPrice">Price</SelectItem>
          <SelectItem value="category">Category</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}