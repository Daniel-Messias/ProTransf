import React, { useState } from 'react';
import styles from '../styles/Historico.module.css';
import { GiCardDiscard, GiGamepad } from 'react-icons/gi';

export default function Historico({ amistosos, convites, loadingAmistosos, loadingConvites }) {
  const [tipoSelecionado, setTipoSelecionado] = useState(null);

  const convitesHistorico = (convites || []).filter(
    c => c.status === 'aceito' || c.status === 'recusado'
  );

  const amistososHistorico = (amistosos || []).filter(
    a => a.status === 'aceito' || a.status === 'recusado'
  );

  return (
    <div className={styles.historicoContainer}>
      <h4 className={styles.titulo}>
        <GiCardDiscard /> Histórico
      </h4>

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

      {tipoSelecionado === 'convites' && (
        <div>
          {loadingConvites ? (
            <p>Carregando convites...</p>
          ) : convitesHistorico.length === 0 ? (
            <p>Sem convites no histórico.</p>
          ) : (
            <ul className={styles.lista}>
              {convitesHistorico.map((convite) => (
                <li key={convite.id} className={styles.item}>
                  <span>{convite.clubeNome || 'Clube desconhecido'}</span>
                  <span className={convite.status === 'aceito' ? styles.statusAceito : styles.statusRecusado}>
                    {convite.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tipoSelecionado === 'amistosos' && (
        <div>
          {loadingAmistosos ? (
            <p>Carregando amistosos...</p>
          ) : amistososHistorico.length === 0 ? (
            <p>Sem jogos disputados.</p>
          ) : (
            <ul className={styles.lista}>
              {amistososHistorico.map((jogo) => (
                <li key={jogo.id} className={styles.item}>
                  <span>{jogo.remetenteNome || 'Clube desconhecido'}</span>
                  <span className={styles.data}>
                    {new Date(jogo.dataAgendada?.seconds * 1000).toLocaleDateString('pt-BR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
