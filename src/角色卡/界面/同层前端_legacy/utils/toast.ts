type ToastLevel = 'success' | 'error' | 'warning' | 'info';

interface ToastrLike {
  success?: (msg: string) => void;
  error?: (msg: string) => void;
  warning?: (msg: string) => void;
  info?: (msg: string) => void;
}

function canUseToastr(): boolean {
  return typeof globalThis !== 'undefined' && typeof (globalThis as { toastr?: unknown }).toastr !== 'undefined';
}

function notify(level: ToastLevel, message: string) {
  if (canUseToastr()) {
    const toastrRef = (globalThis as unknown as { toastr?: ToastrLike }).toastr;
    const handler = toastrRef?.[level];
    if (typeof handler === 'function') {
      handler(message);
      return;
    }
  }

  const logger = level === 'error' ? console.error : console.info;
  logger(`[同层前端:${level}] ${message}`);
}

export function toastSuccess(message: string) {
  notify('success', message);
}

export function toastError(message: string) {
  notify('error', message);
}
