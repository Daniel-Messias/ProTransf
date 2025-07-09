import React, { useEffect, useState } from 'react';
import styles from '../styles/Elenco.module.css';
import { Link } from 'react-router-dom';
import { db } from '../../../services/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const CapitainIcon = () => (
  <span title="Capitão" className={styles.capitaoIcon}>🧢</span>
);

export default function ElencoClube({ clubeId, usuarioLogado }) {
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

  async function removerJogador(index) {
    const jogador = jogadores[index];
    if (!window.confirm(`Deseja remover ${jogador.username} do clube?`)) return;

    try {
      const jogadorRef = doc(db, 'usuarios', jogador.id);
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
  if (!jogadores.length) return <p>Elenco vazio.</p>;

  return (
    <div className={styles.containerElenco}>
      <h3>Elenco do Clube</h3>

      <table className={styles.tabelaJogadores}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Posição</th>
            <th>Plataforma</th>
            <th>Nº Camisa</th>
            <th>Capitão</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {jogadores.map((j, i) => (
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
                  onChange={e => atualizarNumeroCamisa(j.id, e.target.value)}
                  className={styles.inputNumeroCamisa}
                  maxLength={3}
                />
              </td>
              <td data-label="Capitão">
                {j.capitao ? (
                  <CapitainIcon />
                ) : (
                  <button
                    title="Definir Capitão"
                    onClick={() => definirCapitao(j.username)}
                    className={styles.btnCapitao}
                    type="button"
                  >
                    ⚑
                  </button>
                )}
              </td>
              <td data-label="Ações">
                <button
                  onClick={() => removerJogador(i)}
                  className={styles.btnRemoverJogador}
                  type="button"
                  title="Remover jogador"
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botão + para mostrar o input do convite, centralizado abaixo da tabela */}
      {!mostrarInputConvite && (
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

      {/* Input para enviar convite */}
      {mostrarInputConvite && (
        <div className={styles.conviteContainer}>
          <input
            type="email"
            placeholder="Email do jogador"
            value={emailConvite}
            onChange={e => setEmailConvite(e.target.value)}
            disabled={enviandoConvite}
          />
          <button
            onClick={enviarConvite}
            disabled={enviandoConvite}
            type="button"
          >
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
