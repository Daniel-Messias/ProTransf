import React from 'react';
import styles from './CardTransferencia.module.css';
import { Link } from 'react-router-dom';
import { auth } from '../../../services/firebase';

export default function CardTransferencia({ dados, tipo }) {
  const user = auth.currentUser;

  // Detecta se o card é de transferência (exibe Clube → Jogador)
  const isTransferencia = tipo === 'transferencia' && dados.clubeNome && dados.jogadorNome;

  // Define se pode enviar convite (clubes convidam jogadores, jogadores convidam clubes)
  const podeConvidar = !!user && (
    (tipo === 'jogador' && user.tipoUsuario === 'clube') ||
    (tipo === 'clube' && user.tipoUsuario === 'jogador')
  );

  const handleClick = () => {
    if (tipo === 'jogador') {
      alert(`Enviar convite para jogador: ${dados.username || dados.email}`);
    } else if (tipo === 'clube') {
      alert(`Enviar pedido para clube: ${dados.nome}`);
    }
  };

  if (isTransferencia) {
  return (
    <div className={`${styles.cardTransferencia} ${styles[dados.status] || ''}`} role="region">
      <div className={styles.transferBox}>
        <div>
          <strong className={styles.label}>Clube:</strong>
          <p className={styles.value}>{dados.clubeNome}</p>
        </div>
        <div>
          <strong className={styles.label}>Jogador:</strong>
          <p className={styles.value}>{dados.jogadorNome}</p>
        </div>
        <div>
          <strong className={styles.label}>Posição:</strong>
          <p className={styles.value}>{dados.posicao}</p>
        </div>
      </div>
    </div>
  );
}

  // Layout padrão para jogadores e clubes na busca
  return (
    <div className={styles.card} role="region" aria-label={`Card de ${tipo}`}>
      <div className={styles.info}>
        {tipo === 'jogador' ? (
          <>
            <h4>@{dados.username || 'jogador'}</h4>
            <p>Posição: {dados.posicaoPrimaria || 'N/A'}</p>
            <p>Status: {dados.status}</p>
            <p>Plataforma: {dados.plataforma || 'N/A'}</p>
            <Link to={`/perfil-jogador/${dados.username}`} className={styles.link} aria-label={`Ver perfil do jogador ${dados.username}`}>
              Ver Perfil
            </Link>
          </>
        ) : (
          <>
            <h4>{dados.nome}</h4>
            <p>Procurando jogadores: {dados.procura === 'sim' ? 'Sim' : 'Não'}</p>
            <p>Campeonatos: {dados.campeonatos?.join(', ') || 'N/A'}</p>
            <Link to={`/perfil-clube/${dados.id}`} className={styles.link} aria-label={`Ver perfil do clube ${dados.nome}`}>
              Ver Perfil
            </Link>
          </>
        )}
      </div>

      {podeConvidar && (
        <button
          className={styles.btn}
          onClick={handleClick}
          aria-label={tipo === 'jogador' ? `Enviar convite para ${dados.username}` : `Enviar pedido para ${dados.nome}`}
          type="button"
        >
          {tipo === 'jogador' ? 'Enviar Convite' : 'Enviar Pedido'}
        </button>
      )}
    </div>
  );
}
