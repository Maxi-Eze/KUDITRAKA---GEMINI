import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';

interface ProfileInfoProps {
  user: User;
}

function InfoField({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || 'Not set'}</p>
    </div>
  );
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoField label="Name" value={user.ownerName} />
          <InfoField label="Business Name" value={user.businessName} />
          <InfoField label="Email" value={user.email} />
          <InfoField label="Phone" value={user.phone} />
          <InfoField label="Address" value={user.address} />
          <InfoField label="Business Sector" value={user.businessSector} />
          <InfoField label="CAC Number" value={user.cacNumber} />
          <InfoField label="Business Type" value={user.businessType} />
          <InfoField label="Business Size" value={user.businessSize} />
          <InfoField label="Sales Channel" value={user.salesChannel} />
        </div>
        <div className="mt-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Inventory Tracking</p>
            <Badge variant={user.inventoryEnabled ? 'default' : 'secondary'}>
              {user.inventoryEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}