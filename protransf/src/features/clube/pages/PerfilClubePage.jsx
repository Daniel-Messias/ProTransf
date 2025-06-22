import React, { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';
import '../Clube.css';

export default function PerfilClubePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [clubeExiste, setClubeExiste] = useState(false);

  const [nomeClube, setNomeClube] = useState('');
  const [fundacao, setFundacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [procura, setProcura] = useState('sim');
  const [campeonatos, setCampeonatos] = useState([]);
  const [novoCampeonato, setNovoCampeonato] = useState('');
  // Estado novoJogador usa email agora para convite
  const [novoJogador, setNovoJogador] = useState({ email: '', posicao: '', status: '', plataforma: '' });
  const [jogadores, setJogadores] = useState([]);

  useEffect(() => {
    const fetchClube = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const clubeRef = doc(db, 'clubes', user.uid);
      const docSnap = await getDoc(clubeRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNomeClube(data.nome || '');
        setFundacao(data.fundacao || '');
        setDescricao(data.descricao || '');
        setProcura(data.procura || 'nao');
        setCampeonatos(data.campeonatos || []);
        setJogadores(data.jogadores || []);
        setIsOwner(data.donoUid === user.uid);
        setClubeExiste(true);
        setIsEditing(false);
      } else {
        setIsOwner(true);
        setIsEditing(true);
      }
    };

    fetchClube();
  }, []);

  const handleProcuraChange = (e) => setProcura(e.target.value);

  const adicionarCampeonato = () => {
    if (novoCampeonato.trim() !== '') {
      setCampeonatos([...campeonatos, novoCampeonato.trim()]);
      setNovoCampeonato('');
    }
  };

  const removerCampeonato = (index) => {
    setCampeonatos(campeonatos.filter((_, i) => i !== index));
  };

  // Busca jogador pelo email para validar existência
  async function jogadorExiste(email) {
    if (!email) return false;
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email.trim().toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Adicionar jogador envia convite pelo email
  const adicionarJogador = async () => {
    if (!novoJogador.email || !novoJogador.posicao || !novoJogador.status || !novoJogador.plataforma) {
      alert('Preencha todos os campos do jogador.');
      return;
    }

    const existe = await jogadorExiste(novoJogador.email);
    if (!existe) {
      alert(`Jogador com e-mail "${novoJogador.email}" não encontrado. Peça para ele se cadastrar primeiro.`);
      return;
    }

    // Verifica se jogador já está no elenco (compara username, mas temos só email no convite)
    // Assumindo que lista de jogadores tem username, vamos permitir duplicados de email, 
    // pois o convite é por email, mas elenco mantém username.
    // Se quiser evitar duplicatas por email, precisaria mapear email nos jogadores.

    const convitesRef = collection(db, 'convites');
    const conviteQuery = query(
      convitesRef,
      where('clubeId', '==', auth.currentUser.uid),
      where('jogadorEmail', '==', novoJogador.email.trim().toLowerCase()),
      where('status', '==', 'pendente')
    );
    const conviteSnapshot = await getDocs(conviteQuery);
    if (!conviteSnapshot.empty) {
      alert(`Já existe um convite pendente para o jogador com e-mail "${novoJogador.email}".`);
      return;
    }

    try {
      await addDoc(convitesRef, {
        clubeId: auth.currentUser.uid,
        clubeNome: nomeClube,
        jogadorEmail: novoJogador.email.trim().toLowerCase(),
        posicao: novoJogador.posicao,
        status: 'pendente',
        criadoEm: serverTimestamp(),
        plataforma: novoJogador.plataforma,
        statusJogador: novoJogador.status,
      });
      alert(`Convite enviado para o jogador com e-mail "${novoJogador.email}".`);
      setNovoJogador({ email: '', posicao: '', status: '', plataforma: '' });
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      alert('Erro ao enviar convite. Tente novamente.');
    }
  };

 const removerJogador = async (index) => {
  const jogadorRemovido = jogadores[index];
  const user = auth.currentUser;
  if (!jogadorRemovido || !user) return;

  const confirmar = window.confirm(`Deseja realmente remover o jogador ${jogadorRemovido.username}?`);
  if (!confirmar) return;

  const novoElenco = jogadores.filter((_, i) => i !== index);
  setJogadores(novoElenco); // atualiza localmente

  try {
    const clubeRef = doc(db, 'clubes', user.uid);
    await updateDoc(clubeRef, {
      jogadores: novoElenco,
    });

    // Busca o documento do jogador pelo username
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('username', '==', jogadorRemovido.username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const jogadorDoc = snapshot.docs[0];
      await updateDoc(jogadorDoc.ref, {
        status: 'Livre no mercado',
        clubeAtual: '',
      });
    }

    alert(`Jogador ${jogadorRemovido.username} removido com sucesso.`);
  } catch (error) {
    console.error('Erro ao remover jogador:', error);
    alert('Erro ao remover jogador. Tente novamente.');
  }
};

  const salvarAlteracoes = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const clubeRef = doc(db, 'clubes', user.uid);

    try {
      if (!clubeExiste) {
        if (!nomeClube.trim() || !fundacao.trim()) {
          alert('Por favor, preencha o nome do clube e a fundação.');
          return;
        }

        await setDoc(clubeRef, {
          donoUid: user.uid,
          nome: nomeClube.trim(),
          fundacao: fundacao.trim(),
          descricao,
          procura,
          campeonatos,
          jogadores,
          classificacao: 'Sem classificação',
        });
        setClubeExiste(true);
      } else {
        await updateDoc(clubeRef, {
          descricao,
          procura,
          campeonatos,
          jogadores
        });
      }

      setIsEditing(false);
      alert('Clube salvo com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar clube:", error);
      alert('Erro ao salvar clube.');
    }
  };

  const cancelarEdicao = () => {
    if (!clubeExiste) {
      setNomeClube('');
      setFundacao('');
      setDescricao('');
      setProcura('sim');
      setCampeonatos([]);
      setJogadores([]);
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  return (
    <section className="clube-info">
      <h2>{nomeClube || 'Novo Clube'}</h2>

      <div className="clube-detalhes">
        {!clubeExiste && isEditing && (
          <>
            <div className="campo-edicao">
              <label><strong>Nome do Clube:</strong></label>
              <input
                type="text"
                value={nomeClube}
                onChange={(e) => setNomeClube(e.target.value)}
                className="input-edit"
                placeholder="Ex: The Horse FC"
                required
              />
            </div>

            <div className="campo-edicao">
              <label><strong>Data de Fundação:</strong></label>
              <input
                type="text"
                value={fundacao}
                onChange={(e) => setFundacao(e.target.value)}
                className="input-edit"
                placeholder="Ex: 2020"
                required
              />
            </div>
          </>
        )}

        {clubeExiste && (
          <>
            <p><strong>Nome do Clube:</strong> {nomeClube}</p>
            <p><strong>Fundação:</strong> {fundacao}</p>
            <p><strong>Classificação:</strong> Top 1 no ranking</p>
          </>
        )}

        <div>
          <strong>Descrição:</strong><br />
          {isEditing ? (
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: 10, borderRadius: 6 }}
            />
          ) : (
            <p>{descricao}</p>
          )}
        </div>
      </div>

      <div className="info-campeonatos">
        <h3>Campeonatos que Participa</h3>
        <ul>
          {campeonatos.map((campeonato, index) => (
            <li key={index}>
              {campeonato}
              {isEditing && (
                <button onClick={() => removerCampeonato(index)} className="btn-remover">🗑</button>
              )}
            </li>
          ))}
        </ul>
        {isEditing && (
          <div className="adicionar-campeonato">
            <input
              type="text"
              placeholder="Novo campeonato"
              value={novoCampeonato}
              onChange={(e) => setNovoCampeonato(e.target.value)}
              className="input-edit"
            />
            <button onClick={adicionarCampeonato} className="btn-login">Adicionar</button>
          </div>
        )}
      </div>

      <div className="info-procura-jogadores">
        <h3>Procurando Jogadores?</h3>
        <label htmlFor="procura-jogadores">
          <select
            id="procura-jogadores"
            value={procura}
            onChange={handleProcuraChange}
          >
            <option value="sim">Sim!</option>
            <option value="nao">Não.</option>
          </select>
        </label>
        <p id="msg-procura">
          {procura === 'sim'
            ? 'Sim, estamos em busca de novos talentos para nosso elenco!'
            : 'Não, o elenco está fechado no momento.'}
        </p>
      </div>

      <div className="jogadores-lista">
        <h3>Jogadores do Clube</h3>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Posição</th>
              <th>Status</th>
              <th>Plataforma</th>
              {isEditing && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {jogadores.map((jogador, index) => (
              <tr key={index}>
                <td>{jogador.username || 'N/A'}</td>
                <td>{jogador.posicao}</td>
                <td>{jogador.status}</td>
                <td>{jogador.plataforma}</td>
                {isEditing && (
                  <td><button onClick={() => removerJogador(index)} className="btn-remover">❌</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isEditing && (
          <div className="adicionar-campeonato">
            <input
              placeholder="E-mail do Jogador"
              value={novoJogador.email || ''}
              onChange={(e) => setNovoJogador({ ...novoJogador, email: e.target.value })}
              className="input-edit"
            />
            <input
              placeholder="Posição"
              value={novoJogador.posicao || ''}
              onChange={(e) => setNovoJogador({ ...novoJogador, posicao: e.target.value })}
              className="input-edit"
            />
            <input
              placeholder="Status"
              value={novoJogador.status || ''}
              onChange={(e) => setNovoJogador({ ...novoJogador, status: e.target.value })}
              className="input-edit"
            />
            <input
              placeholder="Plataforma"
              value={novoJogador.plataforma || ''}
              onChange={(e) => setNovoJogador({ ...novoJogador, plataforma: e.target.value })}
              className="input-edit"
            />
            <button onClick={adicionarJogador} className="btn-login">Enviar Convite</button>
          </div>
        )}
      </div>

      {!isEditing && isOwner && (
        <button onClick={() => setIsEditing(true)} className="btn-login" style={{ marginTop: 20 }}>
          Editar Clube
        </button>
      )}

      {isEditing && (
        <div style={{ marginTop: 20 }}>
          <button onClick={salvarAlteracoes} className="btn-login" style={{ marginRight: 10 }}>
            Salvar Alterações
          </button>
          <button onClick={cancelarEdicao} className="btn-cancelar">
            Cancelar
          </button>
        </div>
      )}
    </section>
  );
}
