import { useEffect, useState, useCallback } from 'react';
import { showToast, subscribeToToasts, type ToastPayload } from '~/lib/toast';

interface ToastInternal extends Required<ToastPayload> {}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => {
        const next = [...prev, toast];
        return next.slice(-4); // keep last 4 toasts to avoid overflow
      });
      setTimeout(() => removeToast(toast.id), toast.durationMs);
    });
    return unsubscribe;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const variantStyles: Record<string, string> = {
    error: 'border-red-500/40 bg-red-500/10 text-red-100',
    success: 'border-green-500/40 bg-green-500/10 text-green-100',
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-100',
    warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-100',
  };

  return (
    <>
      <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3 w-80 max-w-[90vw]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border backdrop-blur-lg p-4 shadow-xl shadow-black/40 transition-all ${variantStyles[toast.variant]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                <p className="text-sm leading-snug text-white/90">{toast.message}</p>
              </div>
              <button
                aria-label="Close notification"
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white text-sm"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      {children}
    </>
  );
}

// Convenience export so callers can trigger a toast without importing two modules
export { showToast };
