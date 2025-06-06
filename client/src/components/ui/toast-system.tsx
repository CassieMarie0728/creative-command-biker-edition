import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastComponent({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return 'fa-check-circle text-primary';
      case 'error': return 'fa-exclamation-circle text-destructive';
      case 'warning': return 'fa-exclamation-triangle text-accent';
      case 'info': return 'fa-info-circle text-muted-foreground';
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-primary';
      case 'error': return 'border-destructive';
      case 'warning': return 'border-accent';
      case 'info': return 'border-border';
    }
  };

  return (
    <div className={`bg-card border ${getBorderColor()} rounded-lg p-4 shadow-lg max-w-sm transform transition-all duration-300 animate-in slide-in-from-right`}>
      <div className="flex items-center">
        <i className={`fas ${getIcon()} mr-3`} />
        <div className="flex-1">
          <div className="font-bold text-sm text-foreground uppercase tracking-wide">
            {toast.title}
          </div>
          {toast.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {toast.description}
            </div>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <i className="fas fa-times" />
        </button>
      </div>
    </div>
  );
}

export function useToastSystem() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastSystem must be used within a ToastProvider');
  }
  return context;
}
