export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener([...this.toasts]);
    }
  }

  add(type: ToastType, message: string, title?: string, duration: number = 4500) {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = {
      id,
      type,
      title: title || (type === 'error' ? 'SYSTEM ERROR' : type === 'success' ? 'SUCCESS' : type === 'warning' ? 'WARNING' : 'NOTICE'),
      message,
      duration,
    };

    // Keep at most 4 toasts at once to prevent screen overflow
    this.toasts = [...this.toasts.slice(-3), newToast];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }

  error(message: string, title?: string, duration?: number) {
    return this.add('error', message, title, duration);
  }

  success(message: string, title?: string, duration?: number) {
    return this.add('success', message, title, duration);
  }

  info(message: string, title?: string, duration?: number) {
    return this.add('info', message, title, duration);
  }

  warning(message: string, title?: string, duration?: number) {
    return this.add('warning', message, title, duration);
  }
}

export const toast = new ToastManager();
