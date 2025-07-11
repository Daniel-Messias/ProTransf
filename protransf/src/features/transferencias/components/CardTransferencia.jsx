import React from 'react';
import styles from './CardTransferencia.module.css';
import { Link } from 'react-router-dom';
import { auth } from '../../../services/firebase';

export default function CardTransferencia({ dados, tipo }) {
  const user = auth.currentUser;

  const isTransferencia = tipo === 'transferencia' && dados.clubeNome && dados.jogadorNome;
  const isJogador = tipo === 'jogador' || tipo === 'clube_jogador';
  const isClube = tipo === 'clube';

  // Clubes convidam jogadores, jogadores (inclusive clube_jogador) convidam clubes
  const podeConvidar = !!user && (
    (isJogador && user.tipoUsuario === 'clube') ||
    (isClube && (user.tipoUsuario === 'jogador' || user.tipoUsuario === 'clube_jogador'))
  );

  const handleClick = () => {
    if (isJogador) {
      alert(`Enviar convite para jogador: ${dados.username || dados.email}`);
    } else if (isClube) {
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
            <span
              className={`${styles.statusBadge} ${
                dados.status === 'aceito'
                  ? styles['status-aceito']
                  : dados.status === 'recusado'
                  ? styles['status-recusado']
                  : styles['status-pendente']
              }`}
            >
              {dados.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.card} ${isJogador ? styles.cardJogador : styles.cardClube}`}
      role="region"
      aria-label={`Card de ${tipo}`}
    >
      <div className={styles.info}>
        {isJogador ? (
          <div className={styles.fichaJogador}>
            <h4 className={styles.nome}>{dados.nome || 'Jogador'}</h4>
            <p className={styles.username}>@{dados.username || 'usuario'}</p>

            <div className={styles.linha}>
              <span className={styles.icone}>⚽</span>
              <span className={styles.label}>Posição principal:</span>
              <span className={styles.valor}>{dados.posicaoPrimaria || dados.posicao || 'N/A'}</span>
            </div>

            {dados.posicaoSecundaria && (
              <div className={styles.linha}>
                <span className={styles.icone}>🎯</span>
                <span className={styles.label}>Posição secundária:</span>
                <span className={styles.valor}>{dados.posicaoSecundaria}</span>
              </div>
            )}

            {dados.numeroCamisa && (
              <div className={styles.linha}>
                <span className={styles.icone}>🎽</span>
                <span className={styles.label}>Camisa:</span>
                <span className={styles.numeroCamisa}>{dados.numeroCamisa}</span>
              </div>
            )}

            <div className={styles.linha}>
              <span className={styles.icone}>🎮</span>
              <span className={styles.label}>Plataforma:</span>
              <span className={styles.valor}>{dados.plataforma || 'N/A'}</span>
            </div>

            <Link
              to={`/perfil/${dados.id}`}
              className={styles.link}
              aria-label={`Ver perfil do jogador ${dados.username}`}
            >
              Ver Perfil
            </Link>
          </div>
        ) : (
          <div className={styles.fichaClube}>
            <h4 className={styles.nome}>{dados.nome || 'Clube'}</h4>

            <div className={styles.linha}>
              <span className={styles.icone}>🔎</span>
              <span className={styles.label}>Buscando jogadores:</span>
              <span className={styles.valor}>{dados.estaBuscando ? 'Sim' : 'Não'}</span>
            </div>

            <div className={styles.linha}>
              <span className={styles.icone}>🏆</span>
              <span className={styles.label}>Campeonatos:</span>
              <span className={styles.valor}>
                {dados.campeonatos && dados.campeonatos.length > 0
                  ? dados.campeonatos.join(', ')
                  : 'Nenhum campeonato registrado'}
              </span>
            </div>

            <Link
              to={`/perfil/${dados.id}`}
              className={styles.link}
              aria-label={`Ver perfil do clube ${dados.nome}`}
            >
              Ver Perfil
            </Link>
          </div>
        )}
      </div>

      {podeConvidar && (
        <button
          className={styles.btn}
          onClick={handleClick}
          aria-label={isJogador ? `Enviar convite para ${dados.username}` : `Enviar pedido para ${dados.nome}`}
          type="button"
        >
          {isJogador ? 'Enviar Convite' : 'Enviar Pedido'}
        </button>
      )}
    </div>
  );
}
