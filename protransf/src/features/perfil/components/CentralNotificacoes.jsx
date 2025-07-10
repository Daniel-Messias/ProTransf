import React from 'react';
import styles from '../styles/SidebarPerfil.module.css';
import { GiConfirmed, GiCancel, GiGamepad } from 'react-icons/gi';

export default function CentralNotificacoes({
  convites,
  loadingConvites,
  amistosos = [],
  loadingAmistosos = false,
  handleAtualizarStatusConvite,
  aceitarAmistoso,
  recusarAmistoso,
  isDonoPerfil,
  jogadorId,
  clubeId
}) {
  return (
    <div className={styles.section}>
      <h4>
        <GiConfirmed style={{ color: '#32FF7E', marginRight: 6 }} /> Central de Notificações
      </h4>

      {(loadingConvites || loadingAmistosos) ? (
        <p>Carregando notificações...</p>
      ) : convites.length === 0 && amistosos.filter(a => a.status === 'pendente').length === 0 ? (
        <p>Sem notificações no momento.</p>
      ) : (
        <ul className={styles.convitesList}>
          {/* CONVITES */}
          {convites
            .filter(convite => {
              if (convite.status !== 'pendente') return false;
              if (convite.tipo === 'clube_para_jogador' && convite.jogadorId === jogadorId) return true;
              if (convite.tipo === 'jogador_para_clube' && convite.clubeId === clubeId) return true;
              return false;
            })
            .map((convite) => {
              const nomeClube = convite.clubeNome || 'Clube desconhecido';
              const podeResponder = isDonoPerfil && convite.status === 'pendente';

              return (
                <li key={convite.id} className={styles.conviteItem}>
                  <strong>{nomeClube}</strong> está convidando você para jogar.
                  <span className={styles.statusPendente}>pendente</span>

                  {podeResponder && (
                    <div className={styles.acoesConvite}>
                      <button
                        onClick={() =>
                          handleAtualizarStatusConvite(
                            convite.id,
                            'aceito',
                            convite.clubeNome,
                            convite.clubeId,
                            convite.numeroCamisa
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

          {/* AMISTOSOS PENDENTES */}
          {amistosos
            .filter(a => a.status === 'pendente' && a.destinatarioClubeId === clubeId)
            .map((amistoso) => {
              const podeResponder = isDonoPerfil;
              const dataFormatada = amistoso.dataAgendada
                ? new Date(amistoso.dataAgendada.seconds * 1000).toLocaleString()
                : 'Data não definida';

              return (
                <li key={amistoso.id} className={styles.conviteItem}>
                  <strong>{amistoso.remetenteClubeNome || 'Clube desconhecido'}</strong> convidou seu clube para um amistoso.
                  <br />
                  <span className={styles.infoData}>📅 {dataFormatada}</span>

                  {podeResponder && (
                    <div className={styles.acoesConvite}>
                      <button
                        onClick={() => aceitarAmistoso(amistoso.id, amistoso.dataAgendada)}
                        className={`${styles.btnAceitar} ${styles.btnIcon}`}
                        title="Aceitar Amistoso"
                      >
                        <GiConfirmed />
                      </button>

                      <button
                        onClick={() => recusarAmistoso(amistoso.id)}
                        className={`${styles.btnRecusar} ${styles.btnIcon}`}
                        title="Recusar Amistoso"
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
