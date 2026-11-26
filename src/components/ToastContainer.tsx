"use client";

import { CheckCircle2, Info, Trash2, X } from "lucide-react";

export interface ToastItem {
  id: string;
  message: string;
  tone: "success" | "info" | "danger";
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col gap-2.5 print:hidden">
      {toasts.map((t) => {
        const Icon =
          t.tone === "success"
            ? CheckCircle2
            : t.tone === "danger"
              ? Trash2
              : Info;
        const toneClass =
          t.tone === "success"
            ? "border-emerald-500/30 bg-[#101418]/95 text-white"
            : t.tone === "danger"
              ? "border-red-500/30 bg-[#101418]/95 text-red-200"
              : "border-white/12 bg-[#101418]/95 text-white/90";
        const iconClass =
          t.tone === "success"
            ? "text-[#34d399]"
            : t.tone === "danger"
              ? "text-red-400"
              : "text-[#ff6b58]";

        return (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium shadow-2xl shadow-black/70 backdrop-blur-xl transition-all duration-200 ${toneClass}`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="ml-2 rounded p-0.5 text-white/45 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
