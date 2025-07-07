import React, { useState, useEffect } from 'react';
import styles from '../styles/BlocoClube.module.css';
import FormClube from './FormClube';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import ElencoClube from './ElencoClube';

export default function BlocoClube({ usuarioLogado }) {
  const [clube, setClube] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // NOVO: estado para jogadores do clube
  const [jogadores, setJogadores] = useState([]);

  useEffect(() => {
    if (!usuarioLogado?.uid) return;

    setCarregando(true);
    setErro(null);

    // Listener no documento do usuário
    const usuarioRef = doc(db, 'usuarios', usuarioLogado.uid);
    let unsubscribeClube = () => {};

    const unsubscribeUsuario = onSnapshot(usuarioRef, usuarioSnap => {
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
        unsubscribeClube();
        return;
      }

      // Listener no documento do clube
      const clubeRef = doc(db, 'clubes', clubeId);
      unsubscribeClube = onSnapshot(clubeRef, clubeSnap => {
        if (!clubeSnap.exists()) {
          setErro('Clube não encontrado.');
          setClube(null);
        } else {
          setClube({ id: clubeSnap.id, ...clubeSnap.data() });
          setErro(null);
        }
        setCarregando(false);
      }, error => {
        setErro('Erro ao ouvir dados do clube.');
        setClube(null);
        setCarregando(false);
      });
    }, error => {
      setErro('Erro ao ouvir dados do usuário.');
      setClube(null);
      setCarregando(false);
    });

    // Cleanup geral
    return () => {
      unsubscribeUsuario();
      unsubscribeClube();
    };
  }, [usuarioLogado]);

  // NOVO: useEffect para buscar jogadores do clube
  useEffect(() => {
    if (!clube?.id) {
      setJogadores([]);
      return;
    }

    const q = query(collection(db, 'usuarios'), where('clubeAtualId', '==', clube.id));

    const unsubscribe = onSnapshot(q, snapshot => {
      const jogadoresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJogadores(jogadoresData);
    }, error => {
      console.error('Erro ao carregar jogadores do clube:', error);
      setJogadores([]);
    });

    return () => unsubscribe();
  }, [clube?.id]);

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
              className={styles.btnEditar}
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
                  <span>{jogadores.length}</span> {/* Mostrando a quantidade do estado jogadores */}
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
                className={styles.btnEditar}
                onClick={() => setModoEdicao(true)}
              >
                Editar Clube
              </button>

              <h3>Jogadores do Elenco</h3>
              <ElencoClube
                jogadores={jogadores}  
                modoEdicao={false}
                definirCapitao={() => {}}
                removerJogador={() => {}}
                atualizarNumeroCamisa={() => {}}
              />
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
