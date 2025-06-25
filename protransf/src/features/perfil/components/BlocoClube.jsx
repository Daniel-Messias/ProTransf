import React, { useState, useEffect } from 'react';
import styles from '../styles/BlocoClube.module.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export default function BlocoClube({ jogador, clube, loading }) {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    estaBuscando: false,
    campeonatos: '',
  });
  const [salvando, setSalvando] = useState(false);

  // Sincroniza dados do clube ao abrir edição ou quando clube mudar
  useEffect(() => {
    if (clube) {
      setForm({
        nome: clube.nome || '',
        descricao: clube.descricao || '',
        estaBuscando: !!clube.estaBuscando,
        campeonatos: clube.campeonatos ? clube.campeonatos.join(', ') : '',
      });
    }
  }, [clube]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Informações do Clube</h2>
        <p>Carregando dados do clube...</p>
      </div>
    );
  }

  if (jogador.tipo !== 'clube_jogador') {
    // Usuário só jogador, sem clube
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

  async function handleSalvar() {
    setSalvando(true);
    try {
      const clubeRef = doc(db, 'clubes', jogador.clubeAtualId);
      await updateDoc(clubeRef, {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        estaBuscando: form.estaBuscando,
        campeonatos: form.campeonatos.split(',').map(c => c.trim()).filter(c => c !== ''),
      });
      setModoEdicao(false);
      alert('Informações do clube salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados do clube:', error);
      alert('Erro ao salvar dados. Tente novamente.');
    }
    setSalvando(false);
  }

  if (modoEdicao) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Editar Informações do Clube</h2>
        <form className={styles.formGrid} onSubmit={e => e.preventDefault()}>
          <label>
            Nome do Clube:
            <input
              type="text"
              value={form.nome}
              onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </label>
          <label>
            Descrição:
            <input
              type="text"
              value={form.descricao}
              onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
            />
          </label>
          <label>
            Está buscando jogadores?
            <select
              value={form.estaBuscando ? 'sim' : 'nao'}
              onChange={e =>
                setForm(prev => ({ ...prev, estaBuscando: e.target.value === 'sim' }))
              }
            >
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </label>
          <label>
            Campeonatos (separe por vírgula):
            <input
              type="text"
              value={form.campeonatos}
              onChange={e => setForm(prev => ({ ...prev, campeonatos: e.target.value }))}
            />
          </label>
        </form>
        <div className={styles.buttonGroup}>
          <button type="button" onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setModoEdicao(false);
              // Resetar form para dados atuais do clube
              setForm({
                nome: clube.nome || '',
                descricao: clube.descricao || '',
                estaBuscando: !!clube.estaBuscando,
                campeonatos: clube.campeonatos ? clube.campeonatos.join(', ') : '',
              });
            }}
            disabled={salvando}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Modo visualização normal
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Informações do Clube</h2>
      <p className={styles.infoItem}><strong>Nome do Clube:</strong> {clube.nome}</p>
      <p className={styles.infoItem}><strong>Descrição:</strong> {clube.descricao || 'Sem descrição.'}</p>
      <p className={styles.infoItem}><strong>Está buscando jogadores?</strong> {clube.estaBuscando ? 'Sim' : 'Não'}</p>
      <p className={styles.infoItem}><strong>Campeonatos:</strong> {clube.campeonatos?.join(', ') || 'Nenhum informado'}</p>

      <button className={styles.editButton} onClick={() => setModoEdicao(true)}>
        Editar Informações do Clube
      </button>
    </div>
  );
}
