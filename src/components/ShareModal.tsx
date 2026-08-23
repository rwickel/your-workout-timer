import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, MessageCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { Wod } from '@/types/wod';
import { shareUrlFor, whatsappUrlFor } from '@/lib/wodShare';

interface ShareModalProps {
  wod: Wod;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ wod, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const url = shareUrlFor(wod);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 220,
        margin: 2,
        color: { dark: '#ffffff', light: '#000000' },
      }).catch(() => undefined);
    }
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn('Copy failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xs space-y-4 rounded-xl border border-neutral-900 bg-black p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="section-label">Share "{wod.name}"</h3>
          <button onClick={onClose} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-neutral-600 transition-all duration-150 hover:text-white active:scale-[0.98]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <canvas ref={canvasRef} className="mx-auto rounded-lg" />

        <button
          onClick={copy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-900 py-3 text-sm text-neutral-400 transition-all duration-150 active:scale-[0.98] hover:border-neutral-400 hover:text-white"
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <a
          href={whatsappUrlFor(wod)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all duration-150 active:scale-[0.98] hover:bg-neutral-200"
        >
          <MessageCircle className="h-4 w-4" />
          Share via WhatsApp
        </a>

        <p className="text-[11px] text-neutral-600">
          Scan with another device running this app to import the workout.
        </p>
      </div>
    </div>
  );
};

