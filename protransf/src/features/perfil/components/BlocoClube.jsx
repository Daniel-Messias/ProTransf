import React, { useState, useEffect } from 'react';
import styles from '../styles/BlocoClube.module.css';
import { 
  doc, updateDoc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Link } from 'react-router-dom';

// Ícone simples para capitão (pode substituir por SVG/fonte depois)
const CapitainIcon = () => (
  <span title="Capitão" style={{color: 'gold', fontWeight: 'bold', marginLeft: 6}}>🧢</span>
);

export default function BlocoClube({ jogador, clube, loading }) {
  // Estados principais
  const [modoEdicao, setModoEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    fundacao: '',
    descricao: '',
    estaBuscando: false,
    campeonatos: [], // Array
    jogadores: [],   // Array com objetos { username, posicao, plataforma, status, numeroCamisa, capitão }
  });

  // Novo jogador que está sendo adicionado
  const [novoJogadorEmail, setNovoJogadorEmail] = useState('');
  const [novoJogadorDados, setNovoJogadorDados] = useState({
    username: '',
    posicao: '',
    plataforma: '',
    status: '',
    numeroCamisa: '',
  });

  // Capitão username (único capitão)
  const capitãoUsername = form.jogadores.find(j => j.capitao)?.username || null;

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
      });
    }
  }, [clube]);

  // Enquanto carrega
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Informações do Clube</h2>
        <p>Carregando dados do clube...</p>
      </div>
    );
  }

  // Se usuário não for clube_jogador, mostrar bloqueio upgrade
  if (jogador.tipo !== 'clube_jogador') {
    return (
      <div className={`${styles.container} ${styles.bloqueado}`}>
        <h2 className={styles.title}>Informações do Clube</h2>
        <p>Para acessar as informações do clube, faça o upgrade para Clube + Jogador.</p>
        <button
          className={styles.btnUpgrade}
          onClick={() => alert('Implementar fluxo de upgrade aqui!')}
        >
          Fazer Upgrade
        </button>
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
        posicao: data.posicao || '',
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

  // Ao mudar o email do novo jogador, buscar dados dele
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

  // Adicionar jogador ao elenco
  async function adicionarJogador() {
    // Validações básicas
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

    // Verificar se jogador já está no elenco
    const jaTem = form.jogadores.some(j => j.username === novoJogadorDados.username);
    if (jaTem) {
      alert('Este jogador já está no elenco.');
      return;
    }

    // Adiciona jogador no estado
    const novoJogador = {
      username: novoJogadorDados.username,
      posicao: novoJogadorDados.posicao,
      plataforma: novoJogadorDados.plataforma,
      status: novoJogadorDados.status,
      numeroCamisa: novoJogadorDados.numeroCamisa.trim(),
      capitao: false,
    };
    const novosJogadores = [...form.jogadores, novoJogador];

    setForm(prev => ({ ...prev, jogadores: novosJogadores }));

    // Limpar inputs
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

  // Remover jogador pelo índice
  async function removerJogador(index) {
    if (!window.confirm(`Remover jogador ${form.jogadores[index].username}?`)) return;

    const novosJogadores = form.jogadores.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, jogadores: novosJogadores }));
  }

  // Definir capitão do elenco (único)
  function definirCapitao(username) {
    setForm(prev => ({
      ...prev,
      jogadores: prev.jogadores.map(j => ({
        ...j,
        capitao: j.username === username,
      })),
    }));
  }

  // Atualizar número da camisa do jogador (editável inline)
  function atualizarNumeroCamisa(index, numero) {
    setForm(prev => {
      const copia = [...prev.jogadores];
      copia[index].numeroCamisa = numero;
      return { ...prev, jogadores: copia };
    });
  }

  // Atualizar lista de campeonatos - remover
  function removerCampeonato(index) {
    setForm(prev => ({
      ...prev,
      campeonatos: prev.campeonatos.filter((_, i) => i !== index),
    }));
  }

  // Adicionar campeonato novo
  const [novoCampeonato, setNovoCampeonato] = useState('');
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

  // Salvar alterações no Firebase
  async function handleSalvar() {
    if (!form.nome.trim() || !form.fundacao.trim()) {
      alert('Nome do clube e fundação são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      const clubeRef = doc(db, 'clubes', jogador.clubeAtualId);
      await updateDoc(clubeRef, {
        nome: form.nome.trim(),
        fundacao: form.fundacao.trim(),
        descricao: form.descricao.trim(),
        estaBuscando: form.estaBuscando,
        campeonatos: form.campeonatos,
        jogadores: form.jogadores,
      });

      // Atualizar status e clubeAtual dos jogadores no Firestore (sincronizar)
      for (const jogadorElenco of form.jogadores) {
        try {
          // Buscar usuário pelo username
          const usuariosRef = collection(db, 'usuarios');
          const q = query(usuariosRef, where('username', '==', jogadorElenco.username));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const jogadorDoc = snapshot.docs[0];
            await updateDoc(jogadorDoc.ref, {
              status: 'Contratado',
              clubeAtual: form.nome.trim(),
              numeroCamisa: jogadorElenco.numeroCamisa,
            });
          }
        } catch (err) {
          console.error(`Erro ao atualizar jogador ${jogadorElenco.username}:`, err);
        }
      }

      setModoEdicao(false);
      alert('Informações do clube salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados do clube:', error);
      alert('Erro ao salvar dados. Tente novamente.');
    }
    setSalvando(false);
  }

  // Cancelar edição e resetar formulário para dados atuais do clube
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
      });
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

  // Renderiza lista dos jogadores (modo leitura ou edição)
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
      <h2 className={styles.title}>Informações do Clube</h2>

      {modoEdicao ? (
        <>
          {/* Campos edição */}
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

          {/* Campeonatos */}
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

          {/* Lista de jogadores */}
          <h3>Jogadores do Elenco</h3>
          {renderJogadores()}

          {/* Adicionar jogador */}
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

          {/* Botões ação */}
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
          {/* Modo visualização */}
          <p><strong>Nome do Clube:</strong> {form.nome}</p>
          <p><strong>Fundação:</strong> {form.fundacao}</p>
          <p><strong>Descrição:</strong> {form.descricao || 'Sem descrição.'}</p>
          <p><strong>Está buscando jogadores?</strong> {form.estaBuscando ? 'Sim' : 'Não'}</p>
          <p><strong>Campeonatos:</strong> {form.campeonatos.length ? form.campeonatos.join(', ') : 'Nenhum informado'}</p>

          <h3>Jogadores do Elenco</h3>
          {renderJogadores()}

          <button
            className={styles.editButton}
            onClick={() => setModoEdicao(true)}
            disabled={salvando}
          >
            Editar Clube
          </button>
        </>
      )}
    </div>
  );
}
