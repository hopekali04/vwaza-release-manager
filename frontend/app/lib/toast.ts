export type ToastVariant = 'info' | 'success' | 'error' | 'warning';

export interface ToastPayload {
  id?: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

type ToastListener = (toast: Required<ToastPayload>) => void;

const listeners = new Set<ToastListener>();

export function subscribeToToasts(listener: ToastListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showToast(payload: ToastPayload) {
  const toast: Required<ToastPayload> = {
    id: payload.id || `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: payload.title || 'Something went wrong',
    message: payload.message,
    variant: payload.variant || 'error',
    durationMs: payload.durationMs || 4500,
  };
  listeners.forEach((listener) => listener(toast));
  return toast.id;
}
