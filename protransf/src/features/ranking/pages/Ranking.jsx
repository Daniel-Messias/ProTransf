import React from "react";
import styles from "../ranking.module.css";

export default function Ranking() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Em breve</span>
        <h2 className={styles.title}>Ranking Pro Transfer</h2>
        <p className={styles.text}>
          Em breve você vai poder acompanhar os jogadores mais bem avaliados da temporada.
          <br />
          Esta será a página oficial para eleger o <strong>"Melhor do Mundo do Pro Transfer"</strong>!
        </p>
      </div>
    </div>
  );
}
