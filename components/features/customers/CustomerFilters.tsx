import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

type SortField = 'total' | 'count' | 'name';

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortField;
  onSortChange: (value: SortField) => void;
}

export function CustomerFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
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
          <SelectItem value="total">Total Revenue</SelectItem>
          <SelectItem value="count">Transaction Count</SelectItem>
          <SelectItem value="name">Name A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
