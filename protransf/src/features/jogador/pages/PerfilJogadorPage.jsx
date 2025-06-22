import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from '../Jogador.module.css';
import ConvitesPendentes from '../components/ConvitesPendentes';

export default function PerfilJogadorPage() {
  const [jogador, setJogador] = useState(null);
  const [formData, setFormData] = useState(null);
  const [editando, setEditando] = useState(false);

  // Extraí a função para poder usar fora do useEffect também
  const fetchDadosJogador = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setJogador(data);
        setFormData({
          ...data,
          status: data.status || 'Livre no mercado',
          fotoURL: data.fotoURL || null,
          clubeAtual: data.clubeAtual || '',
        });
      } else {
        console.log('Documento do jogador não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do jogador:', error);
    }
  };

  useEffect(() => {
    fetchDadosJogador();
  }, []);

  const handleEditar = () => setEditando(true);

  const handleCancelar = () => {
    setEditando(false);
    setFormData(jogador);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'usuarios', user.uid);
      await updateDoc(docRef, formData);

      setJogador(formData);
      setEditando(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const avatarRef = ref(storage, `avatars/${user.uid}/avatar.jpg`);
      await uploadBytes(avatarRef, file);

      const url = await getDownloadURL(avatarRef);

      setFormData((prev) => ({ ...prev, fotoURL: url }));

      const docRef = doc(db, 'usuarios', user.uid);
      await updateDoc(docRef, { fotoURL: url });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    }
  };

  if (!formData) return <p>Carregando perfil...</p>;

  const estaContratado = formData.status === 'Contratado';

  return (
    <section className={styles.perfilJogador}>
      {/* Passa a função fetchDadosJogador para o componente ConvitesPendentes */}
      <ConvitesPendentes onAtualizarPerfil={fetchDadosJogador} />

      <div className={styles.perfilTopo}>
        <img
          src={formData.fotoURL || "/default-avatar.jpg"}
          alt="Foto do Jogador"
          className={styles.fotoJogador}
        />

        <div className={styles.infoJogador}>
          {editando && (
            <div className={styles.uploadContainer}>
              <label className={styles.btnUpload}>
                Alterar foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {editando ? (
            <>
              <input
                name="nome"
                value={formData.nome || ''}
                onChange={handleChange}
                placeholder="Nome"
              />
              <input
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                placeholder="Username"
              />
            </>
          ) : (
            <h1>
              {jogador.nome} <span className={styles.nickname}>@{jogador.username}</span>
            </h1>
          )}

          <p>
            <strong>Posição Primária:</strong>{' '}
            {editando ? (
              <input
                name="posicaoPrimaria"
                value={formData.posicaoPrimaria || ''}
                onChange={handleChange}
              />
            ) : (
              formData.posicaoPrimaria || 'Não informado'
            )}
          </p>

          <p>
            <strong>Posição Secundária:</strong>{' '}
            {editando ? (
              <input
                name="posicaoSecundaria"
                value={formData.posicaoSecundaria || ''}
                onChange={handleChange}
              />
            ) : (
              formData.posicaoSecundaria || 'Não informado'
            )}
          </p>

          <p>
            <strong>Plataforma:</strong>{' '}
            {editando ? (
              <input
                name="plataforma"
                value={formData.plataforma || ''}
                onChange={handleChange}
              />
            ) : (
              formData.plataforma || 'Não informado'
            )}
          </p>

          <p>
            <strong>Status:</strong>{' '}
            {editando ? (
              <select
                name="status"
                value={formData.status || 'Livre no mercado'}
                onChange={handleChange}
                disabled={estaContratado}
              >
                <option value="Livre no mercado">Livre no mercado</option>
                <option value="Contratado">Contratado</option>
              </select>
            ) : (
              <span
                className={`${styles.status} ${
                  formData.status === 'Livre no mercado' ? styles.livre : styles.contratado
                }`}
              >
                {formData.status}
              </span>
            )}
          </p>

          <p>
            <strong>Clube Atual:</strong>{' '}
            {editando ? (
              <input
                name="clubeAtual"
                value={formData.clubeAtual || ''}
                onChange={handleChange}
                disabled={estaContratado}
              />
            ) : (
              <span>
                {formData.clubeAtual
                  ? ` ${formData.clubeAtual}`
                  : 'Atualmente sem clube — disponível para propostas!'}
              </span>
            )}
          </p>

          {editando ? (
            <>
              <button onClick={handleSalvar}>Salvar</button>
              <button onClick={handleCancelar}>Cancelar</button>
            </>
          ) : (
            <button className={styles.btnEditar} onClick={handleEditar}>
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      <div className={styles.descricaoJogador}>
        <h2>Sobre o Jogador</h2>
        {editando ? (
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
          />
        ) : (
          <p>{formData.bio || 'Sem descrição adicionada ainda.'}</p>
        )}
      </div>

      <div className={styles.videosDestaque}>
        <h2>Melhores Jogadas</h2>
        {editando ? (
          <>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                name={`videos-${i}`}
                placeholder={`Link do vídeo ${i + 1}`}
                value={formData.videos?.[i] || ''}
                onChange={(e) => {
                  const novosVideos = [...(formData.videos || [])];
                  novosVideos[i] = e.target.value;
                  setFormData({ ...formData, videos: novosVideos });
                }}
              />
            ))}
          </>
        ) : formData.videos?.length ? (
          <div className={styles.videoGrid}>
            {formData.videos.map((url, i) => (
              <div key={i} className={styles.videoWrapper}>
                <iframe
                  src={url}
                  title={`Video ${i + 1}`}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum vídeo enviado.</p>
        )}
      </div>

      <div className={styles.contatoJogador}>
        <h2>Entre em contato com o jogador</h2>
        {editando ? (
          <>
            <input
              name="whatsapp"
              placeholder="WhatsApp com DDD"
              value={formData.whatsapp || ''}
              onChange={handleChange}
            />
            <input
              name="instagram"
              placeholder="Instagram (sem @)"
              value={formData.instagram || ''}
              onChange={handleChange}
            />
          </>
        ) : (
          <p>
            {formData.whatsapp && (
              <a
                href={`https://wa.me/${formData.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            )}{' '}
            {formData.instagram && (
              <a
                href={`https://instagram.com/${formData.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
