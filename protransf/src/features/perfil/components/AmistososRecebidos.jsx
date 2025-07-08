import React, { useState } from 'react';
import styles from '../styles/SidebarPerfil.module.css';
import { GiGamepad } from 'react-icons/gi';

export default function AmistososRecebidos({
  amistosos,
  isDonoPerfil,
  handleDataAgendadaChange,
  aceitarAmistoso,
  recusarAmistoso,
  atualizarResultadoAmistoso
}) {
  const [resultados, setResultados] = useState({});

  if (!amistosos || amistosos.length === 0) return null;

  const handleResultadoChange = (id, valor) => {
    setResultados(prev => ({
      ...prev,
      [id]: valor
    }));
  };

  return (
    <div className={styles.section}>
      <h4><GiGamepad style={{ color: '#ffcc00', marginRight: 6 }} /> Amistosos Recebidos</h4>
      <ul className={styles.convitesList}>
        {amistosos.map((amistoso) => (
          <li key={amistoso.id} className={styles.conviteItem}>
            <strong>{amistoso.remetenteNome || 'Clube desconhecido'}</strong> chamou seu time para um amistoso.

            <span
              className={
                amistoso.status === 'pendente' ? styles.statusPendente
                : amistoso.status === 'aceito' ? styles.statusAceito
                : styles.statusRecusado
              }
            >
              {amistoso.status}
            </span>

            {/* Amistoso Pendente */}
            {amistoso.status === 'pendente' && isDonoPerfil && (
              <div className={styles.acoesConvite}>
                <input
                  type="datetime-local"
                  onChange={e => handleDataAgendadaChange(amistoso.id, e.target.value)}
                  value={
                    amistoso.dataAgendada
                      ? new Date(amistoso.dataAgendada.seconds * 1000).toISOString().slice(0, 16)
                      : ''
                  }
                  className={styles.inputDataAgendada}
                />
                <button
                  onClick={() => aceitarAmistoso(amistoso.id, amistoso.dataAgendada)}
                  className={styles.btnAceitar}
                  disabled={!amistoso.dataAgendada}
                  title="Aceitar Amistoso"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => recusarAmistoso(amistoso.id)}
                  className={styles.btnRecusar}
                  title="Recusar Amistoso"
                >
                  Recusar
                </button>
              </div>
            )}

            {/* Amistoso Aceito - mostrar resultado e permitir edição se dono do perfil */}
            {amistoso.status === 'aceito' && (
              <div className={styles.resultadoContainer}>
                <label>
                  Resultado:
                  <input
                    type="text"
                    value={resultados[amistoso.id] !== undefined ? resultados[amistoso.id] : (amistoso.resultado || '')}
                    onChange={e => handleResultadoChange(amistoso.id, e.target.value)}
                    disabled={!isDonoPerfil}
                    placeholder="Ex: 3x1, Vitória, Empate"
                    className={styles.inputResultado}
                  />
                </label>
                {isDonoPerfil && (
                  <button
                    onClick={() => atualizarResultadoAmistoso(amistoso.id, resultados[amistoso.id] || '')}
                    className={styles.btnSalvarResultado}
                    disabled={!resultados[amistoso.id]}
                  >
                    Salvar Resultado
                  </button>
                )}
              </div>
            )}

          </li>
        ))}
      </ul>
    </div>
  );
}
