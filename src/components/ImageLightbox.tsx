"use client";

import { useEffect } from "react";
import { Download, X } from "lucide-react";
import { downloadFileFromUrl } from "@/components/StepResultsCard";

interface ImageLightboxProps {
  url: string | null;
  title: string;
  onClose: () => void;
}

export function ImageLightbox({ url, title, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!url) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, url]);

  if (!url) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090b]/92 p-4 backdrop-blur-md print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-surface flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
          <h3 className="truncate font-mono text-xs font-semibold text-white sm:text-sm">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void downloadFileFromUrl(url, "ealpr-annotated.jpg")}
              className="btn-coral inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-white/60 transition hover:border-white/20 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto bg-black p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={title}
            className="max-h-[78vh] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
}
