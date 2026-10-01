import React from "react";
import { calcularOverall, getRaridade } from "../utils/overall";
import styles from "./OverallBadge.module.css";

/**
 * Selo redondo estilo FUT com o overall do jogador e o anel colorido
 * de raridade (bronze / prata / ouro / especial).
 *
 * Uso: <OverallBadge jogador={dados} size="sm" />
 */
export default function OverallBadge({ jogador, size = "md" }) {
  const overall = calcularOverall(jogador);
  const raridade = getRaridade(overall);

  return (
    <div
      className={`${styles.badge} ${styles[size]}`}
      style={{
        "--cor-principal": raridade.corPrincipal,
        "--cor-secundaria": raridade.corSecundaria,
      }}
      title={`Overall ${overall} · ${raridade.label}`}
    >
      <span className={styles.numero}>{overall}</span>
      <span className={styles.raridade}>{raridade.label}</span>
    </div>
  );
}
