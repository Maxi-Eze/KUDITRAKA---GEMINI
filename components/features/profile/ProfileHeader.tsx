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
      </CardContent>
    </Card>
  );
}
