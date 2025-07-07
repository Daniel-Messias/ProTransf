import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/BlocoJogador.module.css';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';

export default function BlocoJogador({ jogadorId, modoLeitura }) {
  const [jogador, setJogador] = useState(null);
  const [clubeAtualNome, setClubeAtualNome] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    posicaoPrimaria: '',
    posicaoSecundaria: '',
    videos: [],
    numeroCamisa: '',
  });
  const [novoVideo, setNovoVideo] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!jogadorId) return;

    const jogadorRef = doc(db, 'usuarios', jogadorId);
    const unsubscribe = onSnapshot(
      jogadorRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setJogador({ id: docSnap.id, ...data });

          // Busca nome do clube atual, se existir clubeAtualId
          if (data.clubeAtualId) {
            try {
              const clubeRef = doc(db, 'clubes', data.clubeAtualId);
              const clubeSnap = await getDoc(clubeRef);
             if (clubeSnap.exists()) {
  const clubeData = clubeSnap.data();
  console.log('✅ Dados do clube encontrados:', clubeData);

  if (clubeData.nome) {
    setClubeAtualNome(clubeData.nome);
  } else {
    console.warn('⚠️ Campo "nome" não encontrado no clube:', clubeData);
    setClubeAtualNome('Nome do clube ausente');
  }
} else {
  console.warn('❌ Clube não encontrado com ID:', data.clubeAtualId);
  setClubeAtualNome('Clube não encontrado');
}

            } catch (error) {
              console.error('Erro ao buscar nome do clube:', error);
              setClubeAtualNome('Erro ao carregar clube');
            }
          } else {
            setClubeAtualNome('');
          }

          // Atualiza o form só se não estiver editando para não sobrescrever o que o usuário está digitando
          if (!modoEdicao) {
            setFormData({
              bio: data.bio || '',
              posicaoPrimaria: data.posicaoPrimaria || '',
              posicaoSecundaria: data.posicaoSecundaria || '',
              videos: data.videos || [],
              numeroCamisa: data.numeroCamisa || '',
            });
          }
        }
      },
      (error) => {
        console.error('Erro no listener do jogador:', error);
      }
    );

    return () => unsubscribe();
  }, [jogadorId, modoEdicao]);

  useEffect(() => {
    if (modoLeitura && modoEdicao) {
      setModoEdicao(false);
    }
  }, [modoLeitura, modoEdicao]);

  if (!jogador) return <p>Carregando jogador...</p>;

  const isContratado = jogador.status?.toLowerCase() === 'contratado';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVideo = () => {
    if (novoVideo.trim()) {
      setFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, novoVideo.trim()],
      }));
      setNovoVideo('');
    }
  };

  const handleRemoveVideo = (index) => {
    const newVideos = [...formData.videos];
    newVideos.splice(index, 1);
    setFormData((prev) => ({ ...prev, videos: newVideos }));
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, 'usuarios', uid);
      await updateDoc(userRef, {
        bio: formData.bio,
        posicaoPrimaria: formData.posicaoPrimaria,
        posicaoSecundaria: formData.posicaoSecundaria,
        videos: formData.videos,
        numeroCamisa: formData.numeroCamisa,
      });
      alert('Perfil atualizado com sucesso!');
      setModoEdicao(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>@{jogador.username || 'Sem username'}</h2>

      {!modoEdicao ? (
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Plataforma</strong>
            <span>{jogador.plataforma}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Status</strong>
            <span>{jogador.status}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Clube atual</strong>
            <span>
              {jogador.clubeAtualId ? (
                <Link to={`/perfil/${jogador.clubeAtualId}`}>
                  {clubeAtualNome || 'Ver clube'}
                </Link>
              ) : (
                'Nenhum'
              )}
            </span>
          </div>
          <div className={styles.infoItem}>
            <strong>Número da Camisa</strong>
            <span>{jogador.numeroCamisa || '-'}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Posição Primária</strong>
            <span>{jogador.posicaoPrimaria}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Posição Secundária</strong>
            <span>{jogador.posicaoSecundaria || 'Não informada'}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Bio</strong>
            <span>
              {jogador.bio?.trim() ? (
                jogador.bio
              ) : (
                <span className={styles.vazio}>Sem bio</span>
              )}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.formGrid}>
            <label>
              Bio:
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
            </label>

            <label>
              Posição Primária:
              <select
                name="posicaoPrimaria"
                value={formData.posicaoPrimaria}
                onChange={handleChange}
              >
                <option value="">Nenhuma</option>
                <option value="Goleiro">Goleiro</option>
                <option value="Zagueiro">Zagueiro</option>
                <option value="Lateral">Lateral</option>
                <option value="Volante">Volante</option>
                <option value="Meio Campo">Meio Campo</option>
                <option value="Ponta Esquerda">Ponta Esquerda</option>
                <option value="Ponta Direita">Ponta Direita</option>
                <option value="Atacante">Atacante</option>
              </select>
            </label>

            <label>
              Posição Secundária:
              <select
                name="posicaoSecundaria"
                value={formData.posicaoSecundaria}
                onChange={handleChange}
              >
                <option value="">Nenhuma</option>
                <option value="Goleiro">Goleiro</option>
                <option value="Zagueiro">Zagueiro</option>
                <option value="Lateral">Lateral</option>
                <option value="Volante">Volante</option>
                <option value="Meio Campo">Meio Campo</option>
                <option value="Ponta Esquerda">Ponta Esquerda</option>
                <option value="Ponta Direita">Ponta Direita</option>
                <option value="Atacante">Atacante</option>
              </select>
            </label>

            <label>
              Número da Camisa:
              <input
                type="text"
                name="numeroCamisa"
                value={formData.numeroCamisa}
                onChange={handleChange}
                maxLength={2}
                placeholder="Ex: 10"
                disabled={isContratado}
              />
            </label>
          </div>

          <div className={styles.videosSection}>
            <label>
              Adicionar link de jogada:
              <input
                type="text"
                value={novoVideo}
                onChange={(e) => setNovoVideo(e.target.value)}
              />
              <button onClick={handleAddVideo} type="button">
                Adicionar
              </button>
            </label>
            <ul className={styles.videosList}>
              {formData.videos.map((link, idx) => (
                <li key={idx}>
                  <iframe
                    width="300"
                    height="180"
                    src={link.replace('watch?v=', 'embed/')}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`video-${idx}`}
                  />
                  <button onClick={() => handleRemoveVideo(idx)} type="button">
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              type="button"
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button onClick={() => setModoEdicao(false)} type="button">
              Cancelar
            </button>
          </div>
        </>
      )}

      {!modoEdicao && !modoLeitura && (
        <>
          <div className={styles.videosSection}>
            <h3>Melhores Jogadas:</h3>
            {jogador.videos?.length > 0 ? (
              <ul className={styles.videosList}>
                {jogador.videos.map((link, idx) => (
                  <li key={idx}>
                    <iframe
                      width="300"
                      height="180"
                      src={link.replace('watch?v=', 'embed/')}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title={`video-${idx}`}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.vazio}>Sem jogadas registradas.</p>
            )}
          </div>

          <button
            className={styles.editButton}
            onClick={() => setModoEdicao(true)}
            type="button"
          >
            Editar Perfil do Jogador
          </button>
        </>
      )}
    </div>
  );
}
