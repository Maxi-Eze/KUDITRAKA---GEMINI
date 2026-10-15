import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import type { User } from '@/lib/types';

interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
}

export function ProfileHeader({ user, onEdit }: ProfileHeaderProps) {
  const initials = getInitials(user.ownerName || user.businessName || user.email || '');

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <Avatar className="size-14 shrink-0">
          <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-tight">
            {user.ownerName || 'Your name'}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          {user.businessSector && (
            <Badge variant="secondary" className="mt-2">
              {user.businessSector}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onEdit} className="shrink-0">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </CardContent>
    </Card>
  );
}
