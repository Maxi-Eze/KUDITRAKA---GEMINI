import { Skeleton } from '@/components/ui/skeleton';

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
