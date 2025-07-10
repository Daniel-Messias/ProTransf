import React, { useState, useEffect } from 'react';
import styles from '../styles/BlocoClube.module.css';
import FormClube from './FormClube';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import ElencoClube from './ElencoClube';

export default function BlocoClube({
  usuarioLogado,
  clube: clubeProp,
  modoLeitura = false,
  carregando: carregandoProp = false // <- 👈 corrigido aqui
}) {
   console.log('BlocoClube props recebidas:', { usuarioLogado, clubeProp, modoLeitura, carregandoProp });
  const [clube, setClube] = useState(clubeProp || null);
  const [clubeIdFixo, setClubeIdFixo] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Atualiza o estado local quando o perfil for visitado
  useEffect(() => {
    console.log('BlocoClube useEffect clubeProp mudou:', clubeProp);
    if (clubeProp) {
      setClube(clubeProp);
       setCarregando(false);
    }
  }, [clubeProp]);

  useEffect(() => {
  if (!usuarioLogado?.uid || clubeProp) return;

  setCarregando(true);
  setErro(null);

  const usuarioRef = doc(db, 'usuarios', usuarioLogado.uid);

  const unsubscribeUsuario = onSnapshot(usuarioRef, usuarioSnap => {
    if (!usuarioSnap.exists()) {
      setErro('Usuário não encontrado no banco.');
      setClube(null);
      setCarregando(false);
      return;
    }

    const usuarioData = usuarioSnap.data();
    const clubeId = usuarioData.clubeAtualId;

    if (clubeId) {
      setClubeIdFixo(clubeId); // 🟢 atualiza o ID fixo quando existir
    }

    setCarregando(false);
  }, error => {
    setErro('Erro ao ouvir dados do usuário.');
    setClube(null);
    setCarregando(false);
  });

  return () => unsubscribeUsuario();
}, [usuarioLogado, clubeProp]);

  useEffect(() => {
  if (!clubeIdFixo || clubeProp) return;

  setCarregando(true);
  setErro(null);

  const clubeRef = doc(db, 'clubes', clubeIdFixo);
  const unsubscribeClube = onSnapshot(clubeRef, clubeSnap => {
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

  return () => unsubscribeClube();
}, [clubeIdFixo, clubeProp]);

  function atualizarClubeLocal(novosDados) {
    setClube(prev => ({ ...prev, ...novosDados }));
  }

  // 👇 usa tanto o estado local quanto a prop
  if (carregando || carregandoProp) {
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

          {!modoEdicao && !modoLeitura && (
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
              modoLeitura={modoLeitura}
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

              {!modoLeitura && (
                <button
                  className={styles.btnEditar}
                  onClick={() => setModoEdicao(true)}
                >
                  Editar Clube
                </button>
              )}

              <ElencoClube
                clubeId={clube.id}
                usuarioLogado={usuarioLogado}
                modoLeitura={modoLeitura}
              />
            </>
          ) : (
            <FormClube
              clube={clube}
              usuarioLogado={usuarioLogado}
              modoLeitura={modoLeitura}
              setModoEdicao={setModoEdicao}
              atualizarClubeLocal={atualizarClubeLocal}
            />
          )}
        </>
      )}
    </div>
  );
}
