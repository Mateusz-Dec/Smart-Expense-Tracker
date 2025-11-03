import React, { useEffect } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import styles from "./Modal.module.css";

const iconTypes = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
};

function Modal({ isOpen, onClose, title, message, type = "error" }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const IconComponent = iconTypes[type];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.modalHeader} ${styles[type]}`}>
          <div className={styles.titleContainer}>
            <IconComponent size={24} />
            <h3>{title}</h3>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.confirmButton}>
            Rozumiem
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
