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
import { Link, useParams } from 'react-router-dom';
import '../Clube.css';

export default function PerfilClubePage({ modoLeitura = false }) {
  const { id } = useParams(); // id do clube para modo leitura
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [clubeExiste, setClubeExiste] = useState(false);

  const [nomeClube, setNomeClube] = useState('');
  const [fundacao, setFundacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [procura, setProcura] = useState('sim');
  const [campeonatos, setCampeonatos] = useState([]);
  const [novoCampeonato, setNovoCampeonato] = useState('');
  const [novoJogador, setNovoJogador] = useState({ email: '', posicao: '', status: '', plataforma: '' });
  const [jogadores, setJogadores] = useState([]);

  const [pedidosRecebidos, setPedidosRecebidos] = useState([]);

  useEffect(() => {
    const fetchClube = async () => {
      let clubeId = null;
      if (modoLeitura) {
        clubeId = id;
      } else {
        const user = auth.currentUser;
        if (!user) return;
        clubeId = user.uid;
      }

      const clubeRef = doc(db, 'clubes', clubeId);
      const docSnap = await getDoc(clubeRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNomeClube(data.nome || '');
        setFundacao(data.fundacao || '');
        setDescricao(data.descricao || '');
        setProcura(data.procura || 'nao');
        setCampeonatos(data.campeonatos || []);
        setJogadores(data.jogadores || []);
        setClubeExiste(true);

        if (!modoLeitura) {
          const user = auth.currentUser;
          setIsOwner(data.donoUid === user.uid);
          setIsEditing(false);
        } else {
          setIsOwner(false);
          setIsEditing(false);
        }
      } else {
        if (!modoLeitura) {
          setIsOwner(true);
          setIsEditing(true);
        }
        setClubeExiste(false);
      }
    };

    fetchClube();
  }, [id, modoLeitura]);

  // Atualização: Busca os convites pendentes para esse clube com username do jogador via email
  useEffect(() => {
    if (!isOwner) return;

    const fetchPedidos = async () => {
      try {
        const convitesRef = collection(db, 'convites');
        const q = query(
          convitesRef,
          where('clubeId', '==', auth.currentUser.uid),
          where('status', '==', 'pendente')
        );
        const querySnapshot = await getDocs(q);

        const pedidos = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const convite = doc.data();
            const jogadorEmail = convite.jogadorEmail;

            // Busca usuário pelo email
            const usuariosRef = collection(db, 'usuarios');
            const userQuery = query(usuariosRef, where('email', '==', jogadorEmail));
            const userSnapshot = await getDocs(userQuery);

            let jogadorUsername = convite.jogadorUsername || jogadorEmail; // fallback
            if (!userSnapshot.empty) {
              jogadorUsername = userSnapshot.docs[0].data().username || jogadorUsername;
            }

            return {
              id: doc.id,
              ...convite,
              jogadorUsername,
            };
          })
        );

        setPedidosRecebidos(pedidos);
      } catch (error) {
        console.error('Erro ao buscar pedidos recebidos:', error);
      }
    };

    fetchPedidos();
  }, [isOwner]);

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

  async function jogadorExiste(email) {
    if (!email) return false;
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email.trim().toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async function buscarDadosJogador(email) {
    if (!email) {
      setNovoJogador({ email: '', posicao: '', status: '', plataforma: '' });
      return;
    }
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email.trim().toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const jogadorData = querySnapshot.docs[0].data();
      setNovoJogador({
        email: email.trim().toLowerCase(),
        posicao: jogadorData.posicao || '',
        status: jogadorData.status || '',
        plataforma: jogadorData.plataforma || '',
      });
    } else {
      setNovoJogador({
        email: email.trim().toLowerCase(),
        posicao: '',
        status: '',
        plataforma: '',
      });
    }
  }

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
    setJogadores(novoElenco);

    try {
      const clubeRef = doc(db, 'clubes', user.uid);
      await updateDoc(clubeRef, {
        jogadores: novoElenco,
      });

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

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setNovoJogador((prev) => ({ ...prev, email }));
    buscarDadosJogador(email);
  };

  async function atualizarStatusConvite(id, novoStatus) {
    try {
      const conviteRef = doc(db, 'convites', id);
      await updateDoc(conviteRef, {
        status: novoStatus,
        respondidoEm: serverTimestamp(),
      });

      // Atualizar lista local para refletir mudança imediata
      setPedidosRecebidos((prev) => prev.filter((pedido) => pedido.id !== id));

      // Opcional: atualizar jogador no elenco, etc. conforme regra de negócio

      alert(`Convite ${novoStatus === 'aceito' ? 'aceito' : 'recusado'} com sucesso.`);
    } catch (error) {
      console.error('Erro ao atualizar status do convite:', error);
      alert('Erro ao atualizar status do convite. Tente novamente.');
    }
  }

  return (
    <section className="clube-info">
      <h2>{nomeClube || 'Novo Clube'}</h2>

      <div className="clube-detalhes">
        {!clubeExiste && isEditing && !modoLeitura && (
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
          {isEditing && !modoLeitura ? (
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
              {!modoLeitura && isEditing && (
                <button onClick={() => removerCampeonato(index)} className="btn-remover">🗑</button>
              )}
            </li>
          ))}
        </ul>
        {!modoLeitura && isEditing && (
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
        {!modoLeitura ? (
          <label htmlFor="procura-jogadores">
            <select
              id="procura-jogadores"
              value={procura}
              onChange={handleProcuraChange}
              disabled={modoLeitura}
            >
              <option value="sim">Sim!</option>
              <option value="nao">Não.</option>
            </select>
          </label>
        ) : (
          <p id="msg-procura">
            {procura === 'sim'
              ? 'Sim, estamos em busca de novos talentos para nosso elenco!'
              : 'Não, o elenco está fechado no momento.'}
          </p>
        )}
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
              {!modoLeitura && isEditing && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {jogadores.map((jogador, index) => (
              <tr key={index}>
                <td>
                  <Link
                    to={`/perfil-jogador/${jogador.username}`}
                    className="jogador-link"
                  >
                    {jogador.username || 'N/A'}
                  </Link>
                </td>
                <td>{jogador.posicao}</td>
                <td>{jogador.status}</td>
                <td>{jogador.plataforma}</td>
                {!modoLeitura && isEditing && (
                  <td><button onClick={() => removerJogador(index)} className="btn-remover">❌</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {!modoLeitura && isEditing && (
          <div className="adicionar-campeonato">
            <input
              placeholder="E-mail do Jogador"
              value={novoJogador.email || ''}
              onChange={handleEmailChange}
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

      {/* Seção Pedidos Recebidos - MOSTRAR APENAS PENDENTES */}
      {!modoLeitura && isOwner && (
        <div className="pedidos-recebidos" style={{ marginTop: 40 }}>
          <h3>Pedidos Recebidos</h3>

          {pedidosRecebidos.length === 0 && (
            <p>Nenhum pedido pendente no momento.</p>
          )}

          {pedidosRecebidos.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Posição</th>
                  <th>Plataforma</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecebidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <Link to={`/perfil-jogador/${pedido.jogadorUsername || pedido.jogadorEmail}`}>
                        {pedido.jogadorUsername || pedido.jogadorEmail}
                      </Link>
                    </td>
                    <td>{pedido.posicao}</td>
                    <td>{pedido.plataforma}</td>
                    <td>Pendente</td>
                    <td>
                      <button
                        onClick={() => atualizarStatusConvite(pedido.id, 'aceito')}
                        className="btn-aceitar"
                        style={{ marginRight: 6 }}
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => atualizarStatusConvite(pedido.id, 'recusado')}
                        className="btn-recusar"
                      >
                        Recusar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!modoLeitura && !isEditing && isOwner && (
        <button onClick={() => setIsEditing(true)} className="btn-login" style={{ marginTop: 20 }}>
          Editar Clube
        </button>
      )}

      {!modoLeitura && isEditing && (
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
