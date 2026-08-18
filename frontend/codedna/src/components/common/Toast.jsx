import { AnimatePresence, motion } from "framer-motion";
import useToast from "../../hooks/useToast.js";

const alertClass = {
  error: "alert-error",
  warning: "alert-warning",
  success: "alert-success",
  info: "alert-info",
};

const Toast = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast toast-end toast-bottom z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`alert ${alertClass[toast.type]} shadow-lg cursor-pointer`}
            onClick={() => dismissToast(toast.id)}
          >
            <span className="text-sm">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;