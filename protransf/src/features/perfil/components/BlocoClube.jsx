import React, { useState, useEffect } from 'react';
import styles from '../styles/BlocoClube.module.css';
import FormClube from './FormClube';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export default function BlocoClube({ usuarioLogado }) {
  const [clube, setClube] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  async function buscarClube() {
    setCarregando(true);
    setErro(null);

    try {
      const usuarioRef = doc(db, 'usuarios', usuarioLogado.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()) {
        setErro('Usuário não encontrado no banco.');
        setClube(null);
        setCarregando(false);
        return;
      }

      const usuarioData = usuarioSnap.data();
      const clubeId = usuarioData.clubeAtualId;

      if (!clubeId) {
        setClube(null);
        setCarregando(false);
        return; // usuário ainda não tem clube
      }

      const clubeRef = doc(db, 'clubes', clubeId);
      const clubeSnap = await getDoc(clubeRef);

      if (!clubeSnap.exists()) {
        setErro('Clube não encontrado.');
        setClube(null);
      } else {
        setClube({ id: clubeSnap.id, ...clubeSnap.data() });
      }
    } catch (e) {
      console.error('Erro ao buscar clube:', e);
      setErro('Erro ao buscar clube. Tente novamente.');
      setClube(null);
    }

    setCarregando(false);
  }

  useEffect(() => {
    if (usuarioLogado?.uid) {
      buscarClube();
    }
  }, [usuarioLogado]);

  function atualizarClubeLocal(novosDados) {
    setClube(prev => ({ ...prev, ...novosDados }));
  }

  if (carregando) {
    return (
      <div className={styles.blocoClube}>
        <p>Carregando dados do clube...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={styles.blocoClube}>
        <p>{erro}</p>
      </div>
    );
  }

  return (
    <div className={styles.blocoClube}>
      {!clube ? (
        <div>
          <p>Você ainda não possui um clube cadastrado.</p>

          {!modoEdicao && (
            <button
              className={styles.btnEditar} // botão estilizado como no css exemplo
              onClick={() => setModoEdicao(true)}
            >
              Cadastrar Clube
            </button>
          )}

          {modoEdicao && (
            <FormClube
              usuarioLogado={usuarioLogado}
              modoLeitura={false}
              setModoEdicao={setModoEdicao}
              atualizarClubeLocal={atualizarClubeLocal}
              clube={null}
            />
          )}
        </div>
      ) : (
        <>
          {!modoEdicao ? (
            <>
              <h2 className={styles.tituloClube}>{clube.nome}</h2>

              <div className={styles.infoGrid}>
                {/* Cada info do clube dentro de um box infoItem */}
                <div className={styles.infoItem}>
                  <strong>Fundação</strong>
                  <span>{clube.fundacao || <em className={styles.vazio}>Não informado</em>}</span>
                </div>

                <div className={styles.infoItem}>
                  <strong>Descrição</strong>
                  <span>{clube.descricao || <em className={styles.vazio}>Sem descrição</em>}</span>
                </div>

                <div className={styles.infoItem}>
                  <strong>Buscando jogadores?</strong>
                  <span>{clube.estaBuscando ? 'Sim' : 'Não'}</span>
                </div>

                <div className={styles.infoItem}>
                  <strong>Campeonatos</strong>
                  <span>
                    {clube.campeonatos?.length > 0
                      ? clube.campeonatos.join(', ')
                      : <em className={styles.vazio}>Nenhum</em>}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <strong>Número de Jogadores</strong>
                  <span>{clube.numeroDeJogadores ?? 0}</span>
                </div>

                {clube.logoUrl && (
                  <div className={styles.infoItem}>
                    <strong>Logo do Clube</strong>
                    <img
                      src={clube.logoUrl}
                      alt="Logo do Clube"
                      className={styles.logoClube}
                    />
                  </div>
                )}
              </div>

              <button
                className={styles.btnEditar} // botão azul estilizado
                onClick={() => setModoEdicao(true)}
              >
                Editar Clube
              </button>
            </>
          ) : (
            <FormClube
              clube={clube}
              usuarioLogado={usuarioLogado}
              modoLeitura={false}
              setModoEdicao={setModoEdicao}
              atualizarClubeLocal={atualizarClubeLocal}
            />
          )}
        </>
      )}
    </div>
  );
}
