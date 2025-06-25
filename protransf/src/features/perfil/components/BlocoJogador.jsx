import React, { useState } from 'react';
import styles from '../styles/BlocoJogador.module.css';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';

export default function BlocoJogador({ jogador }) {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formData, setFormData] = useState({ ...jogador });
  const [salvando, setSalvando] = useState(false);

  if (!jogador) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditar = () => {
    setModoEdicao(true);
  };

  const handleCancelar = () => {
    setModoEdicao(false);
    setFormData({ ...jogador });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, 'usuarios', uid);
      await updateDoc(userRef, formData);
      alert('Perfil atualizado com sucesso!');
      setModoEdicao(false);
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      alert('Erro ao salvar. Verifique os campos e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {jogador.fotoURL ? (
          <img src={jogador.fotoURL} alt="Avatar" className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {jogador.nome?.charAt(0).toUpperCase() || "?"}
          </div>
        )}

        <div className={styles.userInfo}>
          <h3 className={styles.nome}>{jogador.nome}</h3>
          <p className={styles.username}>@{jogador.username}</p>
        </div>
      </div>

      {modoEdicao ? (
        <div className={styles.formGrid}>
          <label>
            Nome:
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
            />
          </label>

          <label>
            Username:
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </label>

          <label>
            Plataforma:
            <select
              name="plataforma"
              value={formData.plataforma}
              onChange={handleChange}
            >
              <option value="Xbox">Xbox</option>
              <option value="Playstation">Playstation</option>
              <option value="PC">PC</option>
            </select>
          </label>

          <label>
            Posição Primária:
            <input
              type="text"
              name="posicaoPrimaria"
              value={formData.posicaoPrimaria}
              onChange={handleChange}
            />
          </label>

          <label>
            Posição Secundária:
            <input
              type="text"
              name="posicaoSecundaria"
              value={formData.posicaoSecundaria}
              onChange={handleChange}
            />
          </label>

          <label>
            Status:
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Livre">Livre</option>
              <option value="Contratado">Contratado</option>
            </select>
          </label>
        </div>
      ) : (
        <div className={styles.infoGrid}>
          <p><strong>Plataforma:</strong> {jogador.plataforma}</p>
          <p><strong>Status:</strong> {jogador.status}</p>
          <p><strong>Posição Primária:</strong> {jogador.posicaoPrimaria}</p>
          <p><strong>Posição Secundária:</strong> {jogador.posicaoSecundaria || 'Não informada'}</p>
        </div>
      )}

      {modoEdicao ? (
        <div className={styles.buttonGroup}>
          <button onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <button onClick={handleCancelar}>Cancelar</button>
        </div>
      ) : (
        <button className={styles.editButton} onClick={handleEditar}>
          Editar Perfil do Jogador
        </button>
      )}
    </div>
  );
}
