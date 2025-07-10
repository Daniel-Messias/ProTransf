import React, { useState } from 'react';
import styles from '../styles/CentralNotificacoes.module.css';
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
  const [tipoSelecionado, setTipoSelecionado] = useState(null);

  if (!isDonoPerfil) return null; // 🔒 Bloqueia acesso se não for o dono do perfil

  const convitesPendentes = (convites || []).filter(convite => {
    if (convite.status !== 'pendente') return false;
    if (convite.tipo === 'clube_para_jogador' && convite.jogadorId === jogadorId) return true;
    if (convite.tipo === 'jogador_para_clube' && convite.clubeId === clubeId) return true;
    return false;
  });

  const amistososPendentes = (amistosos || []).filter(
    a => a.status === 'pendente' && a.destinatarioClubeId === clubeId
  );

  const nenhumItem =
    (tipoSelecionado === 'convites' && convitesPendentes.length === 0) ||
    (tipoSelecionado === 'amistosos' && amistososPendentes.length === 0);

  return (
    <div className={styles.centralContainer}>
      <h4 className={styles.titulo}>
        <GiConfirmed style={{ color: '#32FF7E' }} /> Central de Notificações
      </h4>

      {/* Botões Toggle */}
      <div className={styles.botoesToggle}>
        <button
          className={`${styles.botaoToggle} ${tipoSelecionado === 'convites' ? styles.ativo : ''}`}
          onClick={() => setTipoSelecionado(tipoSelecionado === 'convites' ? null : 'convites')}
        >
          Convites
        </button>
        <button
          className={`${styles.botaoToggle} ${tipoSelecionado === 'amistosos' ? styles.ativo : ''}`}
          onClick={() => setTipoSelecionado(tipoSelecionado === 'amistosos' ? null : 'amistosos')}
        >
          Amistosos
        </button>
      </div>

      {(loadingConvites || loadingAmistosos) ? (
        <p>Carregando notificações...</p>
      ) : tipoSelecionado === null ? (
        <p></p>
      ) : nenhumItem ? (
        <p>Sem notificações de {tipoSelecionado} no momento.</p>
      ) : (
        <ul className={styles.lista}>
          {/* Notificações de Convites */}
          {tipoSelecionado === 'convites' && convitesPendentes.map((convite) => {
            const nomeClube = convite.clubeNome || 'Clube desconhecido';

            return (
              <li key={convite.id} className={styles.item}>
                <div>
                  <strong>{nomeClube}</strong> está convidando você para jogar.
                  <span className={styles.statusPendente}>pendente</span>
                </div>

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
              </li>
            );
          })}

          {/* Notificações de Amistosos */}
          {tipoSelecionado === 'amistosos' && amistososPendentes.map((amistoso) => {
            const dataFormatada = amistoso.dataAgendada
              ? new Date(amistoso.dataAgendada.seconds * 1000).toLocaleString()
              : 'Data não definida';

            return (
              <li key={amistoso.id} className={styles.item}>
                <div>
                  <strong>{amistoso.remetenteClubeNome || 'Clube desconhecido'}</strong> convidou seu clube para um amistoso.
                  <br />
                  <span className={styles.infoData}>📅 {dataFormatada}</span>
                  <span className={styles.statusPendente}>pendente</span>
                </div>

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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
