import React from 'react';
import styles from '../styles/SidebarPerfil.module.css';
import { GiConfirmed, GiCancel } from 'react-icons/gi';

export default function CentralNotificacoes({ convites, loadingConvites, handleAtualizarStatusConvite, isDonoPerfil }) {
  return (
    <div className={styles.section}>
      <h4>
        <GiConfirmed style={{ color: '#32FF7E', marginRight: 6 }} /> Central de Notificações
      </h4>
      {loadingConvites ? (
        <p>Carregando convites...</p>
      ) : convites.length === 0 ? (
        <p>Sem convites no momento.</p>
      ) : (
        <ul className={styles.convitesList}>
          {convites
            .filter(convite => convite.tipo === 'clube_para_jogador' && convite.status === 'pendente') // Mostra só pendentes
            .map((convite) => {
              const nomeClube = convite.clubeNome || 'Clube desconhecido';
              const podeResponder = isDonoPerfil && convite.status === 'pendente';

              return (
                <li key={convite.id} className={styles.conviteItem}>
                  <strong>{nomeClube}</strong> está convidando você para jogar.
                  <span
                    className={`${styles.statusBadge} ${
                      convite.status === 'aceito'
                        ? styles.statusAceito
                        : convite.status === 'recusado'
                        ? styles.statusRecusado
                        : styles.statusPendente
                    }`}
                  >
                    {convite.status}
                  </span>

                  {podeResponder && (
                    <div className={styles.acoesConvite}>
                      <button
                        onClick={() =>
                          handleAtualizarStatusConvite(
                            convite.id,
                            'aceito',
                            convite.clubeNome,
                            convite.clubeId,
                            convite.numeroCamisa // <-- importante!
                          )
                        }
                        className={`${styles.btnAceitar} ${styles.btnIcon}`}
                        title="Aceitar Convite"
                      >
                        <GiConfirmed />
                      </button>

                      <button
                        onClick={() =>
                          handleAtualizarStatusConvite(convite.id, 'recusado')
                        }
                        className={`${styles.btnRecusar} ${styles.btnIcon}`}
                        title="Recusar Convite"
                      >
                        <GiCancel />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
