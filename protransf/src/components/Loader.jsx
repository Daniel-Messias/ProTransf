import React from "react";
import styles from "./Loader.module.css";

/**
 * Carregamento estilo FUT: anel holográfico girando.
 * Uso: <Loader texto="Carregando perfil..." />  ou  <Loader telaCheia />
 */
export default function Loader({ texto = "Carregando...", telaCheia = false }) {
  return (
    <div className={`${styles.wrapper} ${telaCheia ? styles.telaCheia : ""}`}>
      <div className={styles.anel} aria-hidden="true" />
      <p className={styles.texto}>{texto}</p>
    </div>
  );
}
