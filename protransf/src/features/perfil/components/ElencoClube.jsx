import React from 'react';
import styles from '../styles/Elenco.module.css';
import { Link } from 'react-router-dom';

const CapitainIcon = () => (
  <span title="Capitão" style={{ color: 'gold', fontWeight: 'bold', marginLeft: 6 }}>🧢</span>
);

export default function ElencoClube({ jogadores, modoEdicao, definirCapitao, removerJogador, atualizarNumeroCamisa }) {
  if (!jogadores.length) return <p>Elenco vazio.</p>;

  return (
    <table className={styles.tabelaJogadores}>
      <thead>
        <tr>
          <th>Username</th>
          <th>Posição</th>
          <th>Plataforma</th>
          <th>Nº Camisa</th>
          <th>Capitão</th>
          {modoEdicao && <th>Ações</th>}
        </tr>
      </thead>
      <tbody>
        {jogadores.map((j, i) => (
          <tr key={j.id}>
            <td>
              <Link
                to={`/perfil/${j.id}`}
                className={styles.linkPerfil}
              >
                {j.username}
              </Link>
            </td>
            <td>{j.posicao}</td>
            <td>{j.plataforma}</td>
            <td>
              {modoEdicao ? (
                <input
                  type="text"
                  value={j.numeroCamisa}
                  onChange={e => atualizarNumeroCamisa(i, e.target.value)}
                  className={styles.inputNumeroCamisa}
                  maxLength={3}
                />
              ) : (
                j.numeroCamisa
              )}
            </td>
            <td>
              {j.capitao ? <CapitainIcon /> : ''}
              {modoEdicao && !j.capitao && (
                <button
                  title="Definir Capitão"
                  onClick={() => definirCapitao(j.username)}
                  className={styles.btnCapitao}
                  type="button"
                >
                  ⚑
                </button>
              )}
            </td>
            {modoEdicao && (
              <td>
                <button
                  onClick={() => removerJogador(i)}
                  className={styles.btnRemoverJogador}
                  type="button"
                  title="Remover jogador"
                >
                  ❌
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
