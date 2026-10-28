'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBusinessLogo } from '@/hooks/useBusinessLogo';
import { getInitials } from '@/lib/utils';
import { Camera, Pencil } from 'lucide-react';
import type { User } from '@/lib/types';

interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
}

export function ProfileHeader({ user, onEdit }: ProfileHeaderProps) {
  const initials = getInitials(user.ownerName || user.businessName || user.email || '');
  const { logo, uploadLogo, removeLogo } = useBusinessLogo(user.id);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    const error = await uploadLogo(file);
    if (error) toast.error(error);
    else toast.success('Logo updated');
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className="shrink-0 text-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative block rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={logo ? 'Change business logo' : 'Upload business logo'}
            title={logo ? 'Change logo' : 'Upload logo'}
          >
            <Avatar className="size-14">
              {logo && <AvatarImage src={logo} alt="Business logo" />}
              <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-foreground text-background shadow">
              <Camera className="h-3 w-3" />
            </span>
          </button>
          {logo && (
            <button type="button" onClick={removeLogo} className="mt-1.5 text-[11px] text-muted-foreground hover:text-destructive">
              Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
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
