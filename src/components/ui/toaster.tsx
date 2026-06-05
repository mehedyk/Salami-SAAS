"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastVariant = "default" | "destructive" | "success";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <Toaster>");
  return ctx;
}

const ICONS = {
  default:     <Info className="w-4 h-4 text-amber-400" />,
  destructive: <AlertCircle className="w-4 h-4 text-rose-400" />,
  success:     <CheckCircle className="w-4 h-4 text-emerald-400" />,
};

const STYLES = {
  default:     "bg-night-900/90 border-white/10",
  destructive: "bg-rose-950/90 border-rose-500/30",
  success:     "bg-emerald-950/90 border-emerald-500/30",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const variant = toast.variant ?? "default";
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl
                  shadow-lg animate-slide-in-right pointer-events-auto
                  max-w-sm w-full ${STYLES[variant]}`}
    >
      <div className="shrink-0 mt-0.5">{ICONS[variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-sm text-white leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="font-body text-xs text-white/60 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
