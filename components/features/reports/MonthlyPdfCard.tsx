'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportsApi } from '@/lib/api/reports';

/** The last 12 months, newest first, as "2026-10" → "October 2026" (Lagos time). */
function recentMonths(count = 12) {
  const [year, month] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit' })
    .format(new Date())
    .split('-')
    .map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1 - i, 1));
    const value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    return { value, label: i === 0 ? `${label} (so far)` : label };
  });
}

export function MonthlyPdfCard() {
  const months = useMemo(() => recentMonths(), []);
  // Last month is the first complete one, so start there.
  const [selected, setSelected] = useState(months[1].value);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    const [year, month] = selected.split('-').map(Number);
    setBusy(true);
    try {
      const { blob, filename } = await reportsApi.getMonthlyPdf(year, month);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `Monthly_Report_${selected}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't make the report right now. Please try again in a few minutes.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" />
          Monthly report (PDF)
        </CardTitle>
        <CardDescription>Your month in 2 pages: sales, expenses, profit, best sellers and stock advice.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select items={months} value={selected} onValueChange={(value) => value && setSelected(value as string)}>
          <SelectTrigger className="h-9 w-full sm:w-56" aria-label="Month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={download} disabled={busy} className="sm:w-auto">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? 'Making your report...' : 'Download PDF'}
        </Button>
      </CardContent>
    </Card>
  );
}
