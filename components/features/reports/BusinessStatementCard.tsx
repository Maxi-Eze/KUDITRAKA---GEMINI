'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Landmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { queryKeys } from '@/hooks/keys';
import { reportsApi } from '@/lib/api/reports';
import { formatCurrency } from '@/lib/utils';

const LENGTHS = [
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
];

/** Owner's statement for a lender, supplier or landlord (Reports page). Hidden until the server has it. */
export function BusinessStatementCard() {
  const [months, setMonths] = useState('6');
  const [busy, setBusy] = useState(false);
  const { data } = useQuery({
    queryKey: queryKeys.reports.statement(months),
    queryFn: () => reportsApi.getStatementData(Number(months)),
    retry: false,
  });
  if (!data) return null;

  const download = async () => {
    setBusy(true);
    try {
      const { blob, filename } = await reportsApi.getStatementPdf(Number(months));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `business-statement-${months}-months.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't make the statement right now. Please try again in a few minutes.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark className="h-4 w-4 text-primary" />
          Business statement (PDF)
        </CardTitle>
        <CardDescription>
          What you sold and your profit each month, from your Misa records. Show it to a lender, a supplier who gives
          you goods on credit, or your landlord.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">
          <span className="text-muted-foreground">{data.period_label}: </span>
          sales <span className="font-semibold">{formatCurrency(data.totals.sales)}</span>, profit{' '}
          <span className="font-semibold">{formatCurrency(data.totals.profit_on_goods)}</span>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select items={LENGTHS} value={months} onValueChange={(v) => v && setMonths(v as string)}>
            <SelectTrigger className="h-9 w-full sm:w-56" aria-label="How many months">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LENGTHS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={download} disabled={busy} className="sm:w-auto">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {busy ? 'Making your statement...' : 'Download statement'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          You can also ask Misa on WhatsApp: &quot;Send my statement for 6 months&quot;.
        </p>
      </CardContent>
    </Card>
  );
}
