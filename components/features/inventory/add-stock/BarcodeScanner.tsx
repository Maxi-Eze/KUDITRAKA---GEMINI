'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Detector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'qr_code'];

/** The phone's own barcode reader when it has one (Chrome on Android), else a small library. */
async function makeDetector(): Promise<Detector> {
  const Native = (globalThis as any).BarcodeDetector;
  if (Native) {
    const supported: string[] = await Native.getSupportedFormats?.().catch(() => []) ?? [];
    const formats = FORMATS.filter((f) => supported.includes(f));
    if (formats.length) return new Native({ formats });
  }
  const { BarcodeDetector } = await import('barcode-detector/ponyfill');
  return new BarcodeDetector({ formats: FORMATS as any }) as unknown as Detector;
}

interface BarcodeScannerProps {
  /** Called once per scan; the same code again within a moment is ignored. */
  onCode: (code: string) => void;
  busy?: boolean;
}

export function BarcodeScanner({ onCode, busy }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'starting' | 'scanning' | 'no-camera'>('starting');
  const [typed, setTyped] = useState('');
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let last = { code: '', at: 0 };

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (stopped) return;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        const detector = await makeDetector();
        setStatus('scanning');
        const tick = async () => {
          if (stopped) return;
          try {
            if (video.readyState >= 2) {
              const [hit] = await detector.detect(video);
              const now = Date.now();
              if (hit?.rawValue && (hit.rawValue !== last.code || now - last.at > 2500)) {
                last = { code: hit.rawValue, at: now };
                navigator.vibrate?.(80);
                onCodeRef.current(hit.rawValue);
              }
            }
          } catch {
            // A frame that can't be read; try the next one.
          }
          timer = setTimeout(tick, 250);
        };
        tick();
      } catch {
        if (!stopped) setStatus('no-camera');
      }
    })();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const submitTyped = () => {
    const code = typed.replace(/\s/g, '');
    if (code) {
      onCode(code);
      setTyped('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-border bg-black">
        <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
        {status === 'scanning' && (
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-primary/80 shadow-[0_0_12px_var(--primary)]" />
        )}
        {status !== 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-white/80">
            {status === 'starting' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Opening the camera...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Can&apos;t open the camera. Allow camera access, or type the number under the barcode below.
              </>
            )}
          </div>
        )}
        {busy && (
          <div className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        )}
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ScanLine className="h-4 w-4" />
        Hold the barcode inside the box. Scan the same item again to add one more.
      </p>
      <div className="flex gap-2">
        <Input
          inputMode="numeric"
          placeholder="Or type the barcode number"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitTyped()}
        />
        <Button variant="outline" onClick={submitTyped} disabled={!typed.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
}
