import React, { useState, useEffect } from 'react';
import styles from '../styles/BlocoClube.module.css';
import FormClube from './FormClube';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import ElencoClube from './ElencoClube';

// Componente simples para a chamada de upgrade
function ChamadaUpgradePlano({ onClique }) {
  return (
    <div style={{
      background: 'transparent',
      color: '#fff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
      textAlign: 'center',
      marginBottom: '20px',
    }}>
      <h2 style={{ marginBottom: '12px', fontSize: '22px' }}>
        ⚽ Dê o próximo passo na sua carreira!
      </h2>
      <p style={{ fontSize: '16px', marginBottom: '18px' }}>
        Com o plano <strong>Clube + Jogador</strong> você cria seu clube, participa de campeonatos e chama atenção dos grandes nomes do futebol.
      </p>
      <button
        style={{
          backgroundColor: '#1a1a1a',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'background 0.3s',
        }}
        onClick={onClique}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
      >
        Ver planos de upgrade
      </button>
    </div>
  );
}


export default function BlocoClube({
  usuarioLogado,
  clube: clubeProp,
  modoLeitura = false,
  carregando: carregandoProp = false
}) {
  // Flags para controlar fluxo de acordo com tipo do usuário
  const isJogador = usuarioLogado?.tipo === 'jogador';
  const isClubeJogador = usuarioLogado?.tipo === 'clube_jogador';
  const temClube = !!usuarioLogado?.clubeAtualId;

  const mostrarChamadaUpgrade = isJogador && !temClube;
  const modoLeituraLocal = isJogador && temClube;
    console.log('BlocoClube usuarioLogado:', usuarioLogado, {
    isJogador,
    isClubeJogador,
    temClube,
    mostrarChamadaUpgrade,
  });


  // Estados
  const [clube, setClube] = useState(clubeProp || null);
  const [clubeIdFixo, setClubeIdFixo] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
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

    const unsubscribeUsuario = onSnapshot(usuarioRef, async (usuarioSnap) => {
      if (!usuarioSnap.exists()) {
        setErro('Usuário não encontrado no banco.');
        setClube(null);
        setCarregando(false);
        return;
      }

      const usuarioData = usuarioSnap.data();
      let clubeId = usuarioData.clubeAtualId;

      if (!clubeId) {
        // Se não estiver no clube, verifica se é dono de algum clube
        const clubesRef = collection(db, 'clubes');
        const q = query(clubesRef, where('donoUid', '==', usuarioLogado.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          clubeId = snapshot.docs[0].id;
        }
      }

      if (clubeId) {
        setClubeIdFixo(clubeId);
      } else {
        setClubeIdFixo(null);
      }

      setCarregando(false);
    }, (error) => {
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

  // MOSTRAR CHAMADA PARA UPGRADE
  if (mostrarChamadaUpgrade) {
    return (
      <div className={styles.blocoClube}>
        <ChamadaUpgradePlano
          onClique={() => {
            // TODO: Implementar navegação para página de planos/upgrade
            alert('Aqui vai a navegação para planos e pagamentos');
          }}
        />
      </div>
    );
  }

  // SE NÃO TEM CLUBE
  if (!clube) {
    return (
      <div className={styles.blocoClube}>
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
    );
  }

  // SE TEM CLUBE
  return (
    <div className={styles.blocoClube}>
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

          {/* Botão editar só aparece se NÃO for modo leitura */}
          {!(modoLeituraLocal || modoLeitura) && (
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
            modoLeitura={modoLeituraLocal || modoLeitura}
          />
        </>
      ) : (
        <FormClube
          clube={clube}
          usuarioLogado={usuarioLogado}
          modoLeitura={modoLeituraLocal || modoLeitura}
          setModoEdicao={setModoEdicao}
          atualizarClubeLocal={atualizarClubeLocal}
        />
      )}
    </div>
  );
}
