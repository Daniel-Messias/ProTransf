import React, { useState, useEffect } from 'react';
import styles from '../styles/FormClube.module.css';
import {
  doc, updateDoc, addDoc, collection, serverTimestamp
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
    logoUrl: '',
    status: 'ativo',
    numeroDeJogadores: 0,
    ultimaAtualizacao: null,
    criadoPorUsuarioId: '',
    criadoEm: null,
  });

  const [novoCampeonato, setNovoCampeonato] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (clube) {
      setForm({
        nome: clube.nome || '',
        fundacao: clube.fundacao || '',
        descricao: clube.descricao || '',
        estaBuscando: !!clube.estaBuscando,
        campeonatos: clube.campeonatos || [],
        logoUrl: clube.logoUrl || '',
        status: clube.status || 'ativo',
        numeroDeJogadores: clube.numeroDeJogadores || 0,
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
          logoUrl: form.logoUrl,
          status: form.status,
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
          logoUrl: form.logoUrl,
          status: 'ativo',
          numeroDeJogadores: 0,
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
