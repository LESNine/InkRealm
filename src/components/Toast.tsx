import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function showToast(type: Toast['type'], message: string) {
  addToastFn?.({ type, message });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-bamboo" />,
    error: <XCircle className="w-5 h-5 text-cinnabar" />,
    warning: <AlertCircle className="w-5 h-5 text-gold" />,
    info: <Info className="w-5 h-5 text-ink-500" />,
  };

  const bgColors = {
    success: 'bg-bamboo/10 border-bamboo/30',
    error: 'bg-cinnabar/10 border-cinnabar/30',
    warning: 'bg-gold/10 border-gold/30',
    info: 'bg-ink-50 border-ink-200',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[toast.type]} animate-[slideIn_0.3s_ease-out]`}
        >
          {icons[toast.type]}
          <span className="text-sm text-ink-800">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 text-ink-400 hover:text-ink-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
