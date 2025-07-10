import React, { useEffect, useState } from 'react';
import styles from '../styles/Elenco.module.css';
import { Link } from 'react-router-dom';
import { db } from '../../../services/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

const CapitainIcon = () => (
  <svg
    title="Capitão"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="24"
    viewBox="0 0 40 24"
    role="img"
    aria-label="Capitão"
    style={{ verticalAlign: 'middle' }}
  >
    <defs>
      <radialGradient id="grad" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#ff5555" />
        <stop offset="100%" stopColor="#b22222" />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>

    {/* Faixa curva (braçadeira) */}
    <path
      d="M4 6 C15 2, 25 2, 36 6 L36 18 C25 22, 15 22, 4 18 Z"
      fill="url(#grad)"
      filter="url(#shadow)"
      stroke="#7b1212"
      strokeWidth="1"
    />

    {/* Letra C estilizada no centro */}
    <text
      x="20"
      y="15"
      fill="#fff"
      fontWeight="bold"
      fontSize="14"
      fontFamily="Georgia, serif"
      textAnchor="middle"
      alignmentBaseline="middle"
      pointerEvents="none"
      style={{ userSelect: 'none' }}
    >
      C
    </text>
  </svg>
);


export default function ElencoClube({ clubeId, usuarioLogado, modoLeitura = false }) {
  const [jogadores, setJogadores] = useState([]);
  const [emailConvite, setEmailConvite] = useState('');
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [mostrarInputConvite, setMostrarInputConvite] = useState(false);

  useEffect(() => {
    if (!clubeId) return;

    const q = query(collection(db, 'usuarios'), where('clubeAtualId', '==', clubeId));
    const unsubscribe = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJogadores(lista);
    });

    return () => unsubscribe();
  }, [clubeId]);

  async function definirCapitao(username) {
    try {
      const q = query(collection(db, 'usuarios'), where('clubeAtualId', '==', clubeId));
      const snapshot = await getDocs(q);

      const updates = snapshot.docs.map(docSnap => {
        const isCapitao = docSnap.data().username === username;
        return updateDoc(doc(db, 'usuarios', docSnap.id), { capitao: isCapitao });
      });

      await Promise.all(updates);
      alert(`Novo capitão definido: ${username}`);
    } catch (error) {
      console.error('Erro ao definir capitão:', error);
      alert('Erro ao definir capitão.');
    }
  }

  async function atualizarNumeroCamisa(jogadorId, numero) {
    try {
      await updateDoc(doc(db, 'usuarios', jogadorId), { numeroCamisa: numero });
    } catch (error) {
      console.error('Erro ao atualizar número da camisa:', error);
      alert('Erro ao atualizar número.');
    }
  }

  async function removerJogador(jogadorId, username) {
    if (!window.confirm(`Deseja remover ${username} do clube?`)) return;

    try {
      const jogadorRef = doc(db, 'usuarios', jogadorId);
      await updateDoc(jogadorRef, {
        clubeAtualId: '',
        status: 'livre',
        podeEditarNumeroCamisa: true,
        capitao: false,
      });
      alert('Jogador removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      alert('Erro ao remover jogador.');
    }
  }

  async function enviarConvite() {
    if (!emailConvite.trim()) {
      alert('Informe o e-mail do jogador.');
      return;
    }

    setEnviandoConvite(true);

    try {
      // Busca o usuário pelo email
      const q = query(collection(db, 'usuarios'), where('email', '==', emailConvite.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert('Nenhum jogador encontrado com esse e-mail.');
        setEnviandoConvite(false);
        return;
      }

      const jogadorDoc = snapshot.docs[0];
      const jogadorData = jogadorDoc.data();

      // Busca dados do clube para pegar o nome
      const clubeDoc = await getDoc(doc(db, 'clubes', clubeId));
      const clubeData = clubeDoc.exists() ? clubeDoc.data() : {};

      // Cria o convite com os campos extras
      await addDoc(collection(db, 'convites'), {
        tipo: 'clube_para_jogador',
        jogadorId: jogadorDoc.id,
        jogadorEmail: jogadorData.email || '',
        jogadorUsername: jogadorData.username || '',
        numeroCamisa: '', // pode ajustar se quiser preencher aqui
        plataforma: jogadorData.plataforma || '',
        posicao: jogadorData.posicao || '',
        clubeId: clubeId,
        clubeNome: clubeData.nome || '',
        status: 'pendente',
        criadoEm: serverTimestamp(),
      });

      alert('Convite enviado com sucesso!');
      setEmailConvite('');
      setMostrarInputConvite(false);
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      alert('Erro ao enviar convite.');
    }

    setEnviandoConvite(false);
  }

  return (
    <div className={styles.containerElenco}>
      <h3>Elenco do Clube</h3>

      {jogadores.length === 0 ? (
        <p>Elenco vazio.</p>
      ) : (
        <table className={styles.tabelaJogadores}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Posição</th>
              <th>Plataforma</th>
              <th>Nº Camisa</th>
              <th>Capitão</th>
              {!modoLeitura && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {jogadores.map((j) => (
              <tr key={j.id}>
                <td data-label="Username">
                  <Link to={`/perfil/${j.id}`} className={styles.linkPerfil}>
                    {j.username}
                  </Link>
                </td>
                <td data-label="Posição">{j.posicao}</td>
                <td data-label="Plataforma">{j.plataforma}</td>
                <td data-label="Nº Camisa">
                  <input
                    type="text"
                    value={j.numeroCamisa || ''}
                    onChange={(e) => atualizarNumeroCamisa(j.id, e.target.value)}
                    className={styles.inputNumeroCamisa}
                    maxLength={3}
                    disabled={modoLeitura}
                  />
                </td>
                <td data-label="Capitão">
                  {j.capitao ? (
                    <CapitainIcon />
                  ) : (
                    !modoLeitura && (
                      <button
                        title="Definir Capitão"
                        onClick={() => definirCapitao(j.username)}
                        className={styles.btnCapitao}
                        type="button"
                      >
                        ⚑
                      </button>
                    )
                  )}
                </td>
                {!modoLeitura && (
                  <td data-label="Ações">
                    <button
                      onClick={() => removerJogador(j.id, j.username)}
                      className={styles.btnRemoverJogador}
                      type="button"
                      title="Remover jogador"
                    >
                      ❌
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!mostrarInputConvite && !modoLeitura && (
        <div className={styles.botaoAdicionarContainer}>
          <button
            className={styles.btnMostrarConvite}
            onClick={() => setMostrarInputConvite(true)}
            title="Adicionar jogador"
            type="button"
          >
            +
          </button>
        </div>
      )}

      {mostrarInputConvite && !modoLeitura && (
        <div className={styles.conviteContainer}>
          <input
            type="email"
            placeholder="Email do jogador"
            value={emailConvite}
            onChange={(e) => setEmailConvite(e.target.value)}
            disabled={enviandoConvite}
          />
          <button onClick={enviarConvite} disabled={enviandoConvite} type="button">
            {enviandoConvite ? 'Enviando...' : 'Enviar Convite'}
          </button>
          <button
            type="button"
            onClick={() => setMostrarInputConvite(false)}
            title="Cancelar"
            className={styles.btnCancelarConvite}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
