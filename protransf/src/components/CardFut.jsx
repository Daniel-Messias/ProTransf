import React from "react";
import { Link } from "react-router-dom";
import { calcularOverall, getRaridade } from "../utils/overall";
import { getFoto, getNomeExibicao, getSiglaPosicao } from "../utils/jogador";
import styles from "./CardFut.module.css";

/**
 * Card de jogador no formato dos cards do FUT: overall + posição no canto,
 * foto ao centro, nome e 4 atributos embaixo. Cor pela raridade.
 *
 * Uso: <CardFut jogador={dados} />  (clicável, leva ao perfil)
 *      <CardFut jogador={dados} rodape="Camisa 10" tamanho="sm" />
 */
export default function CardFut({ jogador, rodape, tamanho = "md", destaque = false }) {
  const overall = calcularOverall(jogador);
  const raridade = getRaridade(overall);
  const foto = getFoto(jogador);
  const nome = getNomeExibicao(jogador);

  const atributos = [
    ["GOL", jogador.totalGols],
    ["AST", jogador.totalAssistencias],
    ["DES", jogador.totalDesarmes],
    ["DEF", jogador.totalDefesas],
  ];

  return (
    <Link
      to={`/jogador/${jogador.id}`}
      className={`${styles.wrap} ${destaque ? styles.destaque : ""}`}
      style={{
        "--cor-principal": raridade.corPrincipal,
        "--cor-secundaria": raridade.corSecundaria,
      }}
      title={`${nome} · Overall ${overall} (${raridade.label})`}
    >
      <div className={`${styles.card} ${styles[tamanho]} ${styles[raridade.id]}`}>
        <div className={styles.topo}>
          <span className={styles.overall}>{overall}</span>
          <span className={styles.posicao}>{getSiglaPosicao(jogador)}</span>
        </div>

        <div className={styles.foto}>
          {foto ? <img src={foto} alt={nome} /> : <span>{nome.charAt(0)}</span>}
        </div>

        <div className={styles.nome}>{nome}</div>

        <div className={styles.atributos}>
          {atributos.map(([sigla, valor]) => (
            <div key={sigla}>
              <strong>{Number(valor || 0)}</strong>
              <span>{sigla}</span>
            </div>
          ))}
        </div>

        {rodape && <div className={styles.rodape}>{rodape}</div>}
      </div>
    </Link>
  );
}
