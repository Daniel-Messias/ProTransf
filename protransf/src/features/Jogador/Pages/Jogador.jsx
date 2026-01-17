// src/features/Jogador/Pages/Jogador.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { db, auth } from '../../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { storage } from '../../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import styles from './Jogador.module.css';
import campo2 from "../../../assets/fotos/campo2.png";
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

// Converte link normal do YouTube para embed com autoplay
function transformarUrlYoutube(url) {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');

    if (!videoId) {
      return url;
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  } catch (e) {
    return url;
  }
}

export default function Jogador() {
  const { id } = useParams();

  const [jogador, setJogador] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [ehProprioPerfil, setEhProprioPerfil] = useState(false);

  const [editando, setEditando] = useState(false);

  const [nomeEdit, setNomeEdit] = useState("");
  const [bioEdit, setBioEdit] = useState("");
  const [posicaoPrimariaEdit, setPosicaoPrimariaEdit] = useState("");
  const [posicaoSecundariaEdit, setPosicaoSecundariaEdit] = useState("");
  const [numeroCamisaEdit, setNumeroCamisaEdit] = useState("");
  const [plataformaEdit, setPlataformaEdit] = useState("");

  const [fotoPreview, setFotoPreview] = useState("");
  const [fotoFile, setFotoFile] = useState(null);   // arquivo real da foto
  const [salvando, setSalvando] = useState(false);  // mostrar "Salvando..."

  const handleEditarClick = () => {
    if (editando) {
      setEditando(false);
      return;
    }

    if (!jogador) return;

    setNomeEdit(jogador.nome || "");
    setBioEdit(jogador.bio || "");
    setPosicaoPrimariaEdit(jogador.posicaoPrimaria || "");
    setPosicaoSecundariaEdit(jogador.posicaoSecundaria || "");
    setNumeroCamisaEdit(jogador.numeroCamisa || "");
    setPlataformaEdit(jogador.plataforma || "");
    setFotoPreview(jogador.fotoUrl || "");

    setEditando(true);
  };

  const handleSalvar = async () => {
    if (!jogador) return;
    setSalvando(true);

    try {
      let fotoUrlFinal = jogador.fotoUrl || "";

      // Se selecionou nova foto, faz upload e pega a URL
      if (fotoFile) {
       const storageRef = ref(storage, `fotosJogadores/${jogador.id}-${Date.now()}`);
       await uploadBytes(storageRef, fotoFile);
       fotoUrlFinal = await getDownloadURL(storageRef);
     }

      const refUsuario = doc(db, 'usuarios', jogador.id);

      await updateDoc(refUsuario, {
        nome: nomeEdit,
        bio: bioEdit,
        posicaoPrimaria: posicaoPrimariaEdit,
        posicaoSecundaria: posicaoSecundariaEdit,
        numeroCamisa: numeroCamisaEdit,
        plataforma: plataformaEdit,
        fotoUrl: fotoUrlFinal,
      });

      // Atualiza o estado local
      setJogador(prev =>
        prev
          ? {
              ...prev,
              nome: nomeEdit,
              bio: bioEdit,
              posicaoPrimaria: posicaoPrimariaEdit,
              posicaoSecundaria: posicaoSecundariaEdit,
              numeroCamisa: numeroCamisaEdit,
              plataforma: plataformaEdit,
              fotoUrl: fotoUrlFinal,
            }
          : prev
      );

      setEditando(false);
      setFotoFile(null);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    async function carregarJogador() {
      try {
        setCarregando(true);
        setErro(null);

        const refUsuario = doc(db, 'usuarios', id);
        const snap = await getDoc(refUsuario);

        if (!snap.exists()) {
          setErro('Jogador não encontrado.');
          setJogador(null);
        } else {
          const dados = { id: snap.id, ...snap.data() };
          setJogador(dados);
          setFotoPreview(dados.fotoUrl || "");
          const user = auth.currentUser;
          setEhProprioPerfil(!!user && user.uid === snap.id);
        }
      } catch (error) {
        console.error('Erro ao carregar jogador:', error);
        setErro('Erro ao carregar dados do jogador.');
      } finally {
        setCarregando(false);
      }
    }

    if (id) {
      carregarJogador();
    }
  }, [id]);

  if (carregando) {
    return (
      <section className={styles.container}>
        <p>Carregando perfil do jogador...</p>
      </section>
    );
  }

  if (erro) {
    return (
      <section className={styles.container}>
        <p>{erro}</p>
      </section>
    );
  }

  if (!jogador) {
    return (
      <section className={styles.container}>
        <p>Dados do jogador não disponíveis.</p>
      </section>
    );
  }

  const primeiroVideo =
    Array.isArray(jogador.videos) && jogador.videos.length > 0
      ? transformarUrlYoutube(jogador.videos[0])
      : null;

  const headerStyle = {
    backgroundImage: `url(${campo2})`,
  };

  return (
    <section className={styles.container}>
      <header className={styles.header} style={headerStyle}>
        <div className={styles.cardFoto}>
          {fotoPreview ? (
            <img
              src={fotoPreview}
              alt={`Foto de ${jogador.nome || jogador.username}`}
              className={styles.fotoJogador}
            />
          ) : (
            <div className={styles.fotoPlaceholder}>
              {jogador.nome?.charAt(0) || jogador.username?.charAt(0) || 'J'}
            </div>
          )}

          {ehProprioPerfil && editando && (
            <label className={styles.btnTrocarFoto}>
              Trocar foto
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFotoFile(file);
                  const url = URL.createObjectURL(file);
                  setFotoPreview(url);
                }}
              />
            </label>
          )}
        </div>

        <div className={styles.infoBasica}>
          {!editando && (
            <>
              <h1 className={styles.nomeJogador}>
                {jogador.nome || jogador.username || 'Jogador'}
              </h1>

              <p className={styles.username}>
                @{jogador.username || 'usuario'}
              </p>

              <p className={styles.posicao}>
                Posição: <span>{jogador.posicaoPrimaria || 'N/A'}</span>
                {jogador.posicaoSecundaria && (
                  <span className={styles.posicaoSecundaria}>
                    {' '}| {jogador.posicaoSecundaria}
                  </span>
                )}
              </p>

              <p className={styles.numeroCamisa}>
                Camisa: <span>{jogador.numeroCamisa || '-'}</span>
              </p>

              <p className={styles.plataforma}>
                Plataforma: <span>{jogador.plataforma || 'N/A'}</span>
              </p>

              <p className={styles.status}>
                Status: <span>{jogador.status || 'Indefinido'}</span>
              </p>
            </>
          )}

          {editando && (
            <div className={styles.formEdicao}>
              <h2>Editar perfil</h2>

              <div className={styles.gridCampos}>
                <div className={styles.campo}>
                  <label>Nome</label>
                  <input
                    type="text"
                    value={nomeEdit}
                    onChange={(e) => setNomeEdit(e.target.value)}
                  />
                </div>

                <div className={styles.campo}>
                  <label>Bio</label>
                  <textarea
                    rows={3}
                    value={bioEdit}
                    onChange={(e) => setBioEdit(e.target.value)}
                  />
                </div>

                <div className={styles.campo}>
                  <label>Posição primária</label>
                  <select
                    value={posicaoPrimariaEdit}
                    onChange={(e) => setPosicaoPrimariaEdit(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Goleiro">Goleiro</option>
                    <option value="Zagueiro">Zagueiro</option>
                    <option value="Lateral">Lateral</option>
                    <option value="Volante">Volante</option>
                    <option value="Meio-campo">Meio-campo</option>
                    <option value="Atacante">Atacante</option>
                  </select>
                </div>

                <div className={styles.campo}>
                  <label>Posição secundária</label>
                  <input
                    type="text"
                    value={posicaoSecundariaEdit}
                    onChange={(e) => setPosicaoSecundariaEdit(e.target.value)}
                  />
                </div>

                <div className={styles.campo}>
                  <label>Número da camisa</label>
                  <input
                    type="number"
                    value={numeroCamisaEdit}
                    onChange={(e) => setNumeroCamisaEdit(e.target.value)}
                  />
                </div>

                <div className={styles.campo}>
                  <label>Plataforma</label>
                  <input
                    type="text"
                    value={plataformaEdit}
                    onChange={(e) => setPlataformaEdit(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.botoesEdicao}>
                <button
                  type="button"
                  className={styles.btnSalvar}
                  onClick={handleSalvar}
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>

                <button
                  type="button"
                  className={styles.btnCancelar}
                  onClick={handleEditarClick}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {(jogador.instagram || jogador.whatsapp) && !editando && (
            <div className={styles.contatos}>
              {jogador.instagram && (
                <a
                  href={`https://instagram.com/${jogador.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.iconeRede}
                  aria-label="Instagram do jogador"
                >
                  <FaInstagram />
                </a>
              )}

              {jogador.whatsapp && (
                <a
                  href={`https://wa.me/${jogador.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.iconeRede}
                  aria-label="WhatsApp do jogador"
                >
                  <FaWhatsapp />
                </a>
              )}
            </div>
          )}

          {ehProprioPerfil && !editando && (
            <button
              type="button"
              className={styles.btnEditar}
              onClick={handleEditarClick}
            >
              Editar perfil
            </button>
          )}
        </div>
      </header>

      {jogador.bio && !editando && (
        <section className={`${styles.section} section-global`}>
          <h2>Sobre o jogador</h2>
          <p className={styles.bio}>
            {jogador.bio}
          </p>
        </section>
      )}

      <section className={`${styles.section} section-global`}>
        <h2>Estatísticas gerais</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Gols</span>
            <span className={styles.statValue}>{jogador.totalGols || 0}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Assistências</span>
            <span className={styles.statValue}>{jogador.totalAssistencias || 0}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Desarmes</span>
            <span className={styles.statValue}>{jogador.totalDesarmes || 0}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Defesas</span>
            <span className={styles.statValue}>{jogador.totalDefesas || 0}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Cartões amarelos</span>
            <span className={styles.statValue}>
              {jogador.totalCartoesAmarelos || 0}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Cartões vermelhos</span>
            <span className={styles.statValue}>
              {jogador.totalCartoesVermelhos || 0}
            </span>
          </div>
        </div>
      </section>

      {primeiroVideo && (
        <section className={`${styles.section} section-global`}>
          <h2>Melhores momentos</h2>
          <div className={styles.videoWrapper}>
            <iframe
              src={primeiroVideo}
              title="Melhores momentos do jogador"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className={`${styles.section} section-global`}>
        <h2>Enviar estatísticas de partida</h2>
        <p className={styles.textoAjuda}>
          Em breve aqui terá o formulário para você enviar gols, assistências, desarmes,
          defesas, faltas e cartões com comprovação em foto, para aprovação do responsável.
        </p>
      </section>
    </section>
  );
}
