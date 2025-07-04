import React, { useState, useEffect } from 'react';
import styles from '../styles/BlocoClube.module.css';
import { 
  doc, updateDoc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../services/firebase';


// Ícone simples para capitão (pode substituir por SVG/fonte depois)
const CapitainIcon = () => (
  <span title="Capitão" style={{color: 'gold', fontWeight: 'bold', marginLeft: 6}}>🧢</span>
);

export default function BlocoClube({ jogador, clube, loading, modoLeitura, usuarioLogado }) {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    fundacao: '',
    descricao: '',
    estaBuscando: false,
    campeonatos: [],
    jogadores: [],
    logoUrl: '',
    status: 'ativo',
    numeroDeJogadores: 0,
    ultimaAtualizacao: null,
    criadoPorUsuarioId: '',
    criadoEm: null,
  });

  const [novoJogadorEmail, setNovoJogadorEmail] = useState('');
  const [novoJogadorDados, setNovoJogadorDados] = useState({
    username: '',
    posicao: '',
    plataforma: '',
    status: '',
    numeroCamisa: '',
  });

  const [novoCampeonato, setNovoCampeonato] = useState('');

  // Se o usuário não tem clube cadastrado, já entra no modo criação
  useEffect(() => {
    if (!clube && usuarioLogado) {
      setModoEdicao(true);
      setForm(prev => ({
        ...prev,
        criadoPorUsuarioId: usuarioLogado.uid,
      }));
    }
  }, [clube, usuarioLogado]);

  // Sincroniza dados ao receber clube atualizado
  useEffect(() => {
    if (clube) {
      setForm({
        nome: clube.nome || '',
        fundacao: clube.fundacao || '',
        descricao: clube.descricao || '',
        estaBuscando: !!clube.estaBuscando,
        campeonatos: clube.campeonatos || [],
        jogadores: clube.jogadores || [],
        logoUrl: clube.logoUrl || '',
        status: clube.status || 'ativo',
        numeroDeJogadores: clube.numeroDeJogadores || (clube.jogadores?.length || 0),
        ultimaAtualizacao: clube.ultimaAtualizacao || null,
        criadoPorUsuarioId: clube.criadoPorUsuarioId || '',
        criadoEm: clube.criadoEm || null,
      });
    }
  }, [clube]);
async function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const storageRef = ref(storage, `logosClubes/${usuarioLogado.uid}_${file.name}`);

  try {
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setForm(prev => ({ ...prev, logoUrl: url }));
    alert('Logo enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    alert('Erro ao enviar logo. Tente novamente.');
  }
}

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Informações do Clube</h2>
        <p>Carregando dados do clube...</p>
      </div>
    );
  }

  // Função para buscar dados do jogador pelo email
  async function buscarDadosJogadorPorEmail(email) {
    if (!email.trim()) {
      setNovoJogadorDados({
        username: '',
        posicao: '',
        plataforma: '',
        status: '',
        numeroCamisa: '',
      });
      return;
    }

    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email.trim().toLowerCase()));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      setNovoJogadorDados({
        username: data.username || '',
        posicao: data.posicaoPrimaria || '',
        plataforma: data.plataforma || '',
        status: data.status || '',
        numeroCamisa: '',
      });
    } else {
      setNovoJogadorDados({
        username: '',
        posicao: '',
        plataforma: '',
        status: '',
        numeroCamisa: '',
      });
    }
  }

  useEffect(() => {
    if (novoJogadorEmail.trim()) {
      buscarDadosJogadorPorEmail(novoJogadorEmail);
    } else {
      setNovoJogadorDados({
        username: '',
        posicao: '',
        plataforma: '',
        status: '',
        numeroCamisa: '',
      });
    }
  }, [novoJogadorEmail]);

  async function adicionarJogador() {
  if (
    !novoJogadorEmail.trim() ||
    !novoJogadorDados.username ||
    !novoJogadorDados.posicao ||
    !novoJogadorDados.plataforma ||
    !novoJogadorDados.status ||
    !novoJogadorDados.numeroCamisa.trim()
  ) {
    alert('Preencha todos os campos do jogador, inclusive o número da camisa.');
    return;
  }

  const jaTem = form.jogadores.some(j => j.username === novoJogadorDados.username);
  if (jaTem) {
    alert('Este jogador já está no elenco.');
    return;
  }

  const novoJogador = {
    username: novoJogadorDados.username,
    posicao: novoJogadorDados.posicao,
    plataforma: novoJogadorDados.plataforma,
    status: novoJogadorDados.status,
    numeroCamisa: novoJogadorDados.numeroCamisa.trim(),
    capitao: false,
  };

  // Atualiza localmente
  const novosJogadores = [...form.jogadores, novoJogador];
  setForm(prev => ({
    ...prev,
    jogadores: novosJogadores,
    numeroDeJogadores: novosJogadores.length,
  }));

  try {
    // Atualiza Firestore do jogador
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('username', '==', novoJogador.username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const jogadorDocId = snapshot.docs[0].id;
      const jogadorRef = doc(db, 'usuarios', jogadorDocId);
      await updateDoc(jogadorRef, {
        status: 'contratado',
        clubeAtualId: clube ? clube.id : '', // adapta conforme seu dado do clube
        podeEditarNumeroCamisa: false,
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar jogador no Firestore:', error);
    alert('Erro ao atualizar dados do jogador no Firestore. Tente novamente.');
  }

  // Limpa campos
  setNovoJogadorEmail('');
  setNovoJogadorDados({
    username: '',
    posicao: '',
    plataforma: '',
    status: '',
    numeroCamisa: '',
  });

  alert(`Jogador ${novoJogador.username} adicionado ao elenco!`);
}


  // Remover jogador
  async function removerJogador(index) {
  if (!window.confirm(`Remover jogador ${form.jogadores[index].username}?`)) return;

  const jogadorRemovido = form.jogadores[index];

  try {
    // Busca o documento do jogador pelo username
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('username', '==', jogadorRemovido.username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const jogadorDocId = snapshot.docs[0].id;
      const jogadorRef = doc(db, 'usuarios', jogadorDocId);
      await updateDoc(jogadorRef, {
        status: 'livre',
        clubeAtualId: '',
        podeEditarNumeroCamisa: true, // se usar esse campo
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar jogador no Firestore:', error);
    alert('Erro ao atualizar dados do jogador. Tente novamente.');
    return; // Para não continuar removendo localmente em caso de erro grave
  }

  // Atualiza estado local removendo jogador
  const novosJogadores = form.jogadores.filter((_, i) => i !== index);
  setForm(prev => ({
    ...prev,
    jogadores: novosJogadores,
    numeroDeJogadores: novosJogadores.length,
  }));
}


  // Definir capitão (único)
  function definirCapitao(username) {
    setForm(prev => ({
      ...prev,
      jogadores: prev.jogadores.map(j => ({
        ...j,
        capitao: j.username === username,
      })),
    }));
  }

  // Atualizar número da camisa
  function atualizarNumeroCamisa(index, numero) {
    setForm(prev => {
      const copia = [...prev.jogadores];
      copia[index].numeroCamisa = numero;
      return { ...prev, jogadores: copia };
    });
  }

  // Campeonatos
  function adicionarCampeonato() {
    if (novoCampeonato.trim() === '') return;
    if (form.campeonatos.includes(novoCampeonato.trim())) {
      alert('Campeonato já está na lista.');
      return;
    }
    setForm(prev => ({
      ...prev,
      campeonatos: [...prev.campeonatos, novoCampeonato.trim()],
    }));
    setNovoCampeonato('');
  }

  function removerCampeonato(index) {
    setForm(prev => ({
      ...prev,
      campeonatos: prev.campeonatos.filter((_, i) => i !== index),
    }));
  }

  // Salvar ou criar clube
  async function handleSalvar() {
    if (!form.nome.trim() || !form.fundacao.trim()) {
      alert('Nome do clube e fundação são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      if (clube) {
        // Atualizar clube existente
        const clubeRef = doc(db, 'clubes', jogador.clubeAtualId);
        await updateDoc(clubeRef, {
          nome: form.nome.trim(),
          fundacao: form.fundacao.trim(),
          descricao: form.descricao.trim(),
          estaBuscando: form.estaBuscando,
          campeonatos: form.campeonatos,
          jogadores: form.jogadores,
          logoUrl: form.logoUrl,
          status: form.status,
          numeroDeJogadores: form.numeroDeJogadores,
          ultimaAtualizacao: serverTimestamp(),
        });
      } else {
        // Criar novo clube
        const clubesRef = collection(db, 'clubes');
        const novoClubeDoc = await addDoc(clubesRef, {
          nome: form.nome.trim(),
          fundacao: form.fundacao.trim(),
          descricao: form.descricao.trim(),
          estaBuscando: form.estaBuscando,
          campeonatos: form.campeonatos,
          jogadores: form.jogadores,
          logoUrl: form.logoUrl,
          status: 'ativo',
          numeroDeJogadores: form.jogadores.length,
          ultimaAtualizacao: serverTimestamp(),
          criadoPorUsuarioId: usuarioLogado.uid,
          criadoEm: serverTimestamp(),
        });

        // Atualiza o clubeAtualId do usuário logado
        const userRef = doc(db, 'usuarios', usuarioLogado.uid);
        await updateDoc(userRef, {
          clubeAtualId: novoClubeDoc.id,
        });
      }
      setModoEdicao(false);
      alert('Clube salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar clube:', error);
      alert('Erro ao salvar clube. Tente novamente.');
    }
    setSalvando(false);
  }

  // Cancelar edição
  function cancelarEdicao() {
    setModoEdicao(false);
    if (clube) {
      setForm({
        nome: clube.nome || '',
        fundacao: clube.fundacao || '',
        descricao: clube.descricao || '',
        estaBuscando: !!clube.estaBuscando,
        campeonatos: clube.campeonatos || [],
        jogadores: clube.jogadores || [],
        logoUrl: clube.logoUrl || '',
        status: clube.status || 'ativo',
        numeroDeJogadores: clube.numeroDeJogadores || (clube.jogadores?.length || 0),
        ultimaAtualizacao: clube.ultimaAtualizacao || null,
        criadoPorUsuarioId: clube.criadoPorUsuarioId || '',
        criadoEm: clube.criadoEm || null,
      });
    } else {
      setForm(prev => ({
        ...prev,
        nome: '',
        fundacao: '',
        descricao: '',
        estaBuscando: false,
        campeonatos: [],
        jogadores: [],
        logoUrl: '',
        status: 'ativo',
        numeroDeJogadores: 0,
        ultimaAtualizacao: null,
        criadoPorUsuarioId: usuarioLogado.uid,
        criadoEm: null,
      }));
    }

    setNovoJogadorEmail('');
    setNovoJogadorDados({
      username: '',
      posicao: '',
      plataforma: '',
      status: '',
      numeroCamisa: '',
    });
  }

  // Renderizar jogadores em tabela
  function renderJogadores() {
    if (!form.jogadores.length) return <p>Elenco vazio.</p>;

    return (
      <table className={styles.tabelaJogadores}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Posição</th>
            <th>Plataforma</th>
            <th>Nº Camisa</th>
            <th>Capitão</th>
            {modoEdicao && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {form.jogadores.map((j, i) => (
            <tr key={j.username}>
              <td>
                <Link to={`/perfil-jogador/${j.username}`} target="_blank" rel="noreferrer" className={styles.linkPerfil}>
                  {j.username}
                </Link>
              </td>
              <td>{j.posicao}</td>
              <td>{j.plataforma}</td>
              <td>
                {modoEdicao ? (
                  <input
                    type="text"
                    value={j.numeroCamisa}
                    onChange={e => atualizarNumeroCamisa(i, e.target.value)}
                    className={styles.inputNumeroCamisa}
                    maxLength={3}
                  />
                ) : (
                  j.numeroCamisa
                )}
              </td>
              <td>
                {j.capitao ? <CapitainIcon /> : ''}
                {modoEdicao && !j.capitao && (
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
              {modoEdicao && (
                <td>
                  <button
                    onClick={() => removerJogador(i)}
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
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{form.nome || 'Clube sem nome'}</h2>

      {modoEdicao ? (
        <>
          <label>
            Nome do Clube*:
            <input
              type="text"
              value={form.nome}
              onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </label>

          <label>
            Fundação*:
            <input
              type="text"
              value={form.fundacao}
              onChange={e => setForm(prev => ({ ...prev, fundacao: e.target.value }))}
              required
            />
          </label>

          <label>
            Descrição:
            <textarea
              rows={3}
              value={form.descricao}
              onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
            />
          </label>

          <label>
            Está buscando jogadores?
            <select
              value={form.estaBuscando ? 'sim' : 'nao'}
              onChange={e => setForm(prev => ({ ...prev, estaBuscando: e.target.value === 'sim' }))}
            >
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </label>

          <label>
  Logo do Clube:
  <input
    type="file"
    accept="image/*"
    onChange={handleLogoUpload}
  />
  {form.logoUrl && (
    <div className={styles.previewLogo}>
      <img src={form.logoUrl} alt="Prévia do Logo" className={styles.logoClube} />
    </div>
  )}
</label>


          <div className={styles.campeonatosContainer}>
            <strong>Campeonatos:</strong>
            <ul>
              {form.campeonatos.map((camp, i) => (
                <li key={i}>
                  {camp}
                  <button
                    type="button"
                    className={styles.btnRemoverCampeonato}
                    onClick={() => removerCampeonato(i)}
                    title="Remover campeonato"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.adicionarCampeonato}>
              <input
                type="text"
                placeholder="Novo campeonato"
                value={novoCampeonato}
                onChange={e => setNovoCampeonato(e.target.value)}
              />
              <button type="button" onClick={adicionarCampeonato}>
                +
              </button>
            </div>
          </div>

          <h3>Jogadores do Elenco</h3>
          {renderJogadores()}

          <div className={styles.adicionarJogador}>
            <h4>Adicionar Jogador por Email</h4>
            <input
              type="email"
              placeholder="Email do jogador"
              value={novoJogadorEmail}
              onChange={e => setNovoJogadorEmail(e.target.value)}
              className={styles.inputEmail}
            />
            <div className={styles.dadosJogador}>
              <p><strong>Username:</strong> {novoJogadorDados.username || '-'}</p>
              <p><strong>Posição:</strong> {novoJogadorDados.posicao || '-'}</p>
              <p><strong>Plataforma:</strong> {novoJogadorDados.plataforma || '-'}</p>
              <p><strong>Status:</strong> {novoJogadorDados.status || '-'}</p>
            </div>
            <label>
              Nº da Camisa*:
              <input
                type="text"
                value={novoJogadorDados.numeroCamisa}
                onChange={e => setNovoJogadorDados(prev => ({ ...prev, numeroCamisa: e.target.value }))}
                maxLength={3}
                required
              />
            </label>
            <button type="button" onClick={adicionarJogador}>
              Adicionar Jogador
            </button>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={handleSalvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button type="button" onClick={cancelarEdicao} disabled={salvando}>
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.dadosClube}>
            <strong>Fundação</strong>
            <span>{form.fundacao}</span>
          </div>

          <div className={styles.dadosClube}>
            <strong>Descrição</strong>
            <span>{form.descricao || 'Sem descrição.'}</span>
          </div>

          <div className={styles.dadosClube}>
            <strong>Está buscando jogadores?</strong>
            <span>{form.estaBuscando ? 'Sim' : 'Não'}</span>
          </div>

          <div className={styles.dadosClube}>
            <strong>Campeonatos</strong>
            <span>{form.campeonatos.length ? form.campeonatos.join(', ') : 'Nenhum informado'}</span>
          </div>

          <div className={styles.dadosClube}>
            <strong>Número de Jogadores</strong>
            <span>{form.jogadores.length}</span>
          </div>

          {form.logoUrl && (
            <div className={styles.dadosClube}>
              <strong>Logo:</strong>
              <br />
              <img src={form.logoUrl} alt="Logo do Clube" className={styles.logoClube} />
            </div>
          )}

          <h3 className={styles.subtitulo}>Jogadores do Elenco</h3>
          {renderJogadores()}

          {!modoLeitura && (
            <button
              className={styles.editButton}
              onClick={() => setModoEdicao(true)}
              disabled={salvando}
            >
              Editar Clube
            </button>
          )}
        </>
      )}
    </div>
  );
}
