import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        success: (m) => console.log(m),
        error: (m) => console.error(m),
        info: (m) => console.log(m),
      },
    };
  }
  return context;
};
