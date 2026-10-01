import React, { useEffect, useState } from "react";
import { TOAST_EVENT } from "../utils/toast";
import styles from "./ToastHost.module.css";

let proximoId = 0;

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(e) {
      const id = ++proximoId;
      setToasts((prev) => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }

    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div className={styles.host} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.tipo] || ""}`}>
          {t.texto}
        </div>
      ))}
    </div>
  );
}
