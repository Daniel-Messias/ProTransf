import React, { useState, useEffect } from 'react';
import styles from '../styles/FormClube.module.css';
import { 
  doc, updateDoc, addDoc, collection, serverTimestamp, getDocs, query, where 
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../services/firebase';

export default function FormClube({ clube, usuarioLogado, modoLeitura, setModoEdicao, atualizarClubeLocal }) {
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

  const [novoCampeonato, setNovoCampeonato] = useState('');
  const [novoJogadorEmail, setNovoJogadorEmail] = useState('');
  const [novoJogadorDados, setNovoJogadorDados] = useState({
    username: '',
    posicao: '',
    plataforma: '',
    status: '',
    numeroCamisa: '',
  });
  const [salvando, setSalvando] = useState(false);

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

  async function convidarJogador() {
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

  try {
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', novoJogadorEmail.trim().toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert('Jogador não encontrado.');
      return;
    }

    const jogadorDoc = snapshot.docs[0];
    const convite = {
      tipo: 'clube_para_jogador',
      status: 'pendente',
      dataEnvio: serverTimestamp(),
      jogadorId: jogadorDoc.id,
      jogadorEmail: novoJogadorEmail.trim(),
      jogadorUsername: novoJogadorDados.username,
      clubeId: clube.id,
      clubeNome: form.nome,
      numeroCamisa: novoJogadorDados.numeroCamisa.trim(),
      posicao: novoJogadorDados.posicao,
      plataforma: novoJogadorDados.plataforma,
    };

    await addDoc(collection(db, 'convites'), convite);

    alert(`Convite enviado para ${novoJogadorDados.username}.`);
    setNovoJogadorEmail('');
    setNovoJogadorDados({
      username: '',
      posicao: '',
      plataforma: '',
      status: '',
      numeroCamisa: '',
    });

  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    alert('Erro ao enviar convite. Tente novamente.');
  }
}
async function pedirDemissao() {
  if (!window.confirm('Você tem certeza que deseja pedir demissão do clube?')) return;

  try {
    // Buscar o documento do usuário logado
    const userRef = doc(db, 'usuarios', usuarioLogado.uid);

    // Atualizar o status ou sinalizar o pedido de demissão
    await updateDoc(userRef, {
      pedidoDemissao: true,  // flag que indica pedido de saída
      status: 'pedido_demissao', // opcional, para controle
      clubeAtualId: '', // opcional, remover clube atual até aprovação
    });

    alert('Pedido de demissão enviado com sucesso!');
    
    // Se quiser, atualizar localmente o estado do clube
    if (atualizarClubeLocal) atualizarClubeLocal(prev => ({
      ...prev,
      jogadores: prev.jogadores.filter(j => j.username !== usuarioLogado.username),
    }));

  } catch (error) {
    console.error('Erro ao pedir demissão:', error);
    alert('Erro ao enviar pedido. Tente novamente.');
  }
}


  async function removerJogador(index) {
    if (!window.confirm(`Remover jogador ${form.jogadores[index].username}?`)) return;

    const jogadorRemovido = form.jogadores[index];

    try {
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('username', '==', jogadorRemovido.username));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const jogadorDocId = snapshot.docs[0].id;
        const jogadorRef = doc(db, 'usuarios', jogadorDocId);
        await updateDoc(jogadorRef, {
          status: 'livre',
          clubeAtualId: '',
          podeEditarNumeroCamisa: true,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar jogador no Firestore:', error);
      alert('Erro ao atualizar dados do jogador. Tente novamente.');
      return;
    }

    const novosJogadores = form.jogadores.filter((_, i) => i !== index);
    setForm(prev => ({
      ...prev,
      jogadores: novosJogadores,
      numeroDeJogadores: novosJogadores.length,
    }));
  }

  function definirCapitao(username) {
    setForm(prev => ({
      ...prev,
      jogadores: prev.jogadores.map(j => ({
        ...j,
        capitao: j.username === username,
      })),
    }));
  }

  function atualizarNumeroCamisa(index, numero) {
    setForm(prev => {
      const copia = [...prev.jogadores];
      copia[index].numeroCamisa = numero;
      return { ...prev, jogadores: copia };
    });
  }

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

  async function handleSalvar() {
    if (!form.nome.trim() || !form.fundacao.trim()) {
      alert('Nome do clube e fundação são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      if (clube) {
        const clubeRef = doc(db, 'clubes', clube.id);
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

        const userRef = doc(db, 'usuarios', usuarioLogado.uid);
        await updateDoc(userRef, {
          clubeAtualId: novoClubeDoc.id,
        });
      }

      alert('Clube salvo com sucesso!');
      setModoEdicao(false);

      if (atualizarClubeLocal) atualizarClubeLocal({ ...form });

    } catch (error) {
      console.error('Erro ao salvar clube:', error);
      alert('Erro ao salvar clube. Tente novamente.');
    }
    setSalvando(false);
  }

  return (
    <form className={styles.formClube} onSubmit={e => e.preventDefault()}>
      <label>
        Nome do Clube*:
        <input
          type="text"
          value={form.nome}
          onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
          required
          disabled={modoLeitura}
        />
      </label>

      <label>
        Fundação*:
        <input
          type="text"
          value={form.fundacao}
          onChange={e => setForm(prev => ({ ...prev, fundacao: e.target.value }))}
          required
          disabled={modoLeitura}
        />
      </label>

      <label>
        Descrição:
        <textarea
          rows={3}
          value={form.descricao}
          onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
          disabled={modoLeitura}
        />
      </label>

      <label>
        Está buscando jogadores?
        <select
          value={form.estaBuscando ? 'sim' : 'nao'}
          onChange={e => setForm(prev => ({ ...prev, estaBuscando: e.target.value === 'sim' }))}
          disabled={modoLeitura}
        >
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </label>

      <label>
        Logo do Clube:
        {!modoLeitura && (
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
        )}
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
              {!modoLeitura && (
                <button
                  type="button"
                  className={styles.btnRemoverCampeonato}
                  onClick={() => removerCampeonato(i)}
                  title="Remover campeonato"
                >
                  🗑
                </button>
              )}
            </li>
          ))}
        </ul>

        {!modoLeitura && (
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
        )}
      </div>

      <h3>Jogadores do Elenco</h3>

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
          {form.jogadores.length === 0 ? (
            <tr><td colSpan={modoLeitura ? 5 : 6}>Elenco vazio.</td></tr>
          ) : (
            form.jogadores.map((j, i) => (
              <tr key={j.username}>
                <td>{j.username}</td>
                <td>{j.posicao}</td>
                <td>{j.plataforma}</td>
                <td>
                  {!modoLeitura ? (
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
                <td>{j.capitao ? '🧢' : ''}</td>
                {!modoLeitura && (
                  <td>
                    {!j.capitao && (
                      <button
                        type="button"
                        title="Definir Capitão"
                        onClick={() => definirCapitao(j.username)}
                        className={styles.btnCapitao}
                      >
                        ⚑
                      </button>
                    )}
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
            ))
          )}
        </tbody>
      </table>

      {!modoLeitura && (
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
          <button type="button" onClick={convidarJogador}>
  Enviar Convite
</button>

        </div>
      )}
      {!modoLeitura && form.jogadores.some(j => j.username === usuarioLogado.username) && (
  <button type="button" onClick={pedirDemissao} className={styles.btnDemissao}>
    Pedir Demissão
  </button>
)}


      {!modoLeitura && (
        <div className={styles.buttonGroup}>
          <button type="button" onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button type="button" onClick={() => setModoEdicao(false)} disabled={salvando}>
            Cancelar
          </button>
        </div>
      )}
    </form>
  );
}
