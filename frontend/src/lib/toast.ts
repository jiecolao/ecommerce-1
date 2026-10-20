export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: ToastAction;
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

  add(
    type: ToastType,
    message: string,
    title?: string,
    duration: number = 5000,
    action?: ToastAction
  ) {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fallbackTitle =
      type === 'error'
        ? 'ACTION FAILED'
        : type === 'success'
        ? 'SUCCESS'
        : type === 'warning'
        ? 'ATTENTION'
        : 'NOTICE';

    const newToast: ToastItem = {
      id,
      type,
      title: title || fallbackTitle,
      message,
      duration,
      action,
    };

    // Keep at most 4 toasts at once to prevent screen overflow
    this.toasts = [...this.toasts.slice(-3), newToast];
    this.notify();

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

  error(message: string, title?: string, duration?: number, action?: ToastAction) {
    return this.add('error', message, title, duration, action);
  }

  success(message: string, title?: string, duration?: number, action?: ToastAction) {
    return this.add('success', message, title, duration, action);
  }

  info(message: string, title?: string, duration?: number, action?: ToastAction) {
    return this.add('info', message, title, duration, action);
  }

  warning(message: string, title?: string, duration?: number, action?: ToastAction) {
    return this.add('warning', message, title, duration, action);
  }
}

export const toast = new ToastManager();
