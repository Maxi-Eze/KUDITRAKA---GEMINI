import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import type { User } from '@/lib/types';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = getInitials(user.ownerName || user.businessName || user.email || '');

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:gap-5 sm:p-6 sm:text-left">
        <Avatar className="size-14 sm:size-16">
          <AvatarFallback className="bg-primary/15 text-base font-semibold text-primary sm:text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div>
            <h2 className="text-lg font-semibold leading-tight">
              {user.ownerName || 'Your name'}
            </h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {user.businessName && <Badge variant="secondary">{user.businessName}</Badge>}
            {user.businessSector && <Badge variant="outline">{user.businessSector}</Badge>}
            <Badge variant={user.inventoryEnabled ? 'default' : 'secondary'}>
              {user.inventoryEnabled ? 'Inventory on' : 'Inventory off'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
