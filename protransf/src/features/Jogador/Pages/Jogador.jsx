import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { db, auth } from "../../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { storage } from "../../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import styles from "./Jogador.module.css";
import campo2 from "../../../assets/fotos/campo2.png";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

// ===============================
// CONVERTER LINK YOUTUBE PARA EMBED
// ===============================
function transformarUrlYoutube(url) {
  if (!url) return "";

  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    if (!videoId) return url;

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  } catch {
    return url;
  }
}

export default function Jogador() {
  const { id } = useParams();

  // ===============================
  // ESTADOS PRINCIPAIS
  // ===============================
  const [jogador, setJogador] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [ehProprioPerfil, setEhProprioPerfil] = useState(false);

  // ===============================
  // CONTROLE DE EDIÇÃO
  // ===============================
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // ===============================
  // CAMPOS DE EDIÇÃO
  // ===============================
  const [nomeEdit, setNomeEdit] = useState("");
  const [bioEdit, setBioEdit] = useState("");
  const [posicaoPrimariaEdit, setPosicaoPrimariaEdit] = useState("");
  const [posicaoSecundariaEdit, setPosicaoSecundariaEdit] = useState("");
  const [numeroCamisaEdit, setNumeroCamisaEdit] = useState("");
  const [plataformaEdit, setPlataformaEdit] = useState("");

  // ===============================
  // FOTO
  // ===============================
  const [fotoPreview, setFotoPreview] = useState("");
  const [fotoFile, setFotoFile] = useState(null);

  // ===============================
  // EDITAR
  // ===============================
  function handleEditarClick() {
    if (!jogador) return;

    if (!editando) {
      setNomeEdit(jogador.nome || "");
      setBioEdit(jogador.bio || "");
      setPosicaoPrimariaEdit(jogador.posicaoPrimaria || "");
      setPosicaoSecundariaEdit(jogador.posicaoSecundaria || "");
      setNumeroCamisaEdit(jogador.numeroCamisaPessoal || "");
      setPlataformaEdit(jogador.plataforma || "");
      setFotoPreview(jogador.fotoUrl || "");
    }

    setEditando(!editando);
  }

  // ===============================
  // SALVAR
  // ===============================
  async function handleSalvar() {
    if (!jogador) return;

    setSalvando(true);

    try {
      let fotoUrlFinal = jogador.fotoUrl || "";

      if (fotoFile) {
        const storageRef = ref(
          storage,
          `fotosJogadores/${jogador.id}-${Date.now()}`
        );
        await uploadBytes(storageRef, fotoFile);
        fotoUrlFinal = await getDownloadURL(storageRef);
      }

      const refUsuario = doc(db, "usuarios", jogador.id);

      await updateDoc(refUsuario, {
        nome: nomeEdit,
        bio: bioEdit,
        posicaoPrimaria: posicaoPrimariaEdit,
        posicaoSecundaria: posicaoSecundariaEdit,
        numeroCamisaPessoal: Number(numeroCamisaEdit),
        plataforma: plataformaEdit,
        fotoUrl: fotoUrlFinal,
        atualizadoEm: new Date(),
      });

      setJogador((prev) => ({
        ...prev,
        nome: nomeEdit,
        bio: bioEdit,
        posicaoPrimaria: posicaoPrimariaEdit,
        posicaoSecundaria: posicaoSecundariaEdit,
        numeroCamisaPessoal: Number(numeroCamisaEdit),
        plataforma: plataformaEdit,
        fotoUrl: fotoUrlFinal,
      }));

      setEditando(false);
      setFotoFile(null);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Erro ao salvar perfil");
    } finally {
      setSalvando(false);
    }
  }

  // ===============================
  // CARREGAR JOGADOR
  // ===============================
  useEffect(() => {
    async function carregarJogador() {
      try {
        setCarregando(true);
        setErro(null);

        const refUsuario = doc(db, "usuarios", id);
        const snap = await getDoc(refUsuario);

        if (!snap.exists()) {
          setErro("Jogador não encontrado.");
          setJogador(null);
          return;
        }

        const dados = { id: snap.id, ...snap.data() };
        setJogador(dados);
        setFotoPreview(dados.fotoUrl || "");

        const user = auth.currentUser;
        setEhProprioPerfil(!!user && user.uid === snap.id);
      } catch (error) {
        console.error("Erro ao carregar jogador:", error);
        setErro("Erro ao carregar dados do jogador.");
      } finally {
        setCarregando(false);
      }
    }

    if (id) carregarJogador();
  }, [id]);

  // ===============================
  // RENDER CONDIÇÕES
  // ===============================
  if (carregando) {
    return <section className={styles.container}>Carregando perfil...</section>;
  }

  if (erro) {
    return <section className={styles.container}>{erro}</section>;
  }

  if (!jogador) {
    return <section className={styles.container}>Jogador não disponível</section>;
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
      {/* ================= HEADER ================= */}
      <header className={styles.header} style={headerStyle}>
        <div className={styles.cardFoto}>
          {fotoPreview ? (
            <img src={fotoPreview} alt={jogador.nome} className={styles.fotoJogador} />
          ) : (
            <div className={styles.fotoPlaceholder}>
              {jogador.nome?.charAt(0) || "J"}
            </div>
          )}

          {ehProprioPerfil && editando && (
            <label className={styles.btnTrocarFoto}>
              Trocar foto
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFotoFile(file);
                  setFotoPreview(URL.createObjectURL(file));
                }}
              />
            </label>
          )}
        </div>

        <div className={styles.infoBasica}>
          {!editando ? (
            <>
              <h1>{jogador.nome}</h1>
              <p>@{jogador.username}</p>

              <p>
                Posição: {jogador.posicaoPrimaria || "N/A"}
                {jogador.posicaoSecundaria && ` | ${jogador.posicaoSecundaria}`}
              </p>

              <p>Camisa: {jogador.numeroCamisaPessoal || "-"}</p>
              <p>Plataforma: {jogador.plataforma || "N/A"}</p>
              <p>Status: {jogador.status}</p>
            </>
          ) : (
            <>
              <input value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} />
              <textarea value={bioEdit} onChange={(e) => setBioEdit(e.target.value)} />
              <input
                value={posicaoPrimariaEdit}
                onChange={(e) => setPosicaoPrimariaEdit(e.target.value)}
              />
              <input
                value={posicaoSecundariaEdit}
                onChange={(e) => setPosicaoSecundariaEdit(e.target.value)}
              />
              <input
                type="number"
                value={numeroCamisaEdit}
                onChange={(e) => setNumeroCamisaEdit(e.target.value)}
              />
              <input
                value={plataformaEdit}
                onChange={(e) => setPlataformaEdit(e.target.value)}
              />
            </>
          )}

          {(jogador.instagram || jogador.whatsapp) && !editando && (
            <div className={styles.contatos}>
              {jogador.instagram && (
                <a
                  href={`https://instagram.com/${jogador.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram />
                </a>
              )}

              {jogador.whatsapp && (
                <a
                  href={`https://wa.me/${jogador.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaWhatsapp />
                </a>
              )}
            </div>
          )}

          {ehProprioPerfil && (
            <>
              {!editando ? (
                <button onClick={handleEditarClick}>Editar perfil</button>
              ) : (
                <>
                  <button onClick={handleSalvar} disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>
                  <button onClick={handleEditarClick}>Cancelar</button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      {/* ================= BIO ================= */}
      {jogador.bio && !editando && (
        <section className={styles.section}>
          <h2>Sobre o jogador</h2>
          <p>{jogador.bio}</p>
        </section>
      )}

      {/* ================= ESTATÍSTICAS ================= */}
      <section className={styles.section}>
        <h2>Estatísticas gerais</h2>
        <div className={styles.statsGrid}>
          <div>Gols: {jogador.totalGols || 0}</div>
          <div>Assistências: {jogador.totalAssistencias || 0}</div>
          <div>Desarmes: {jogador.totalDesarmes || 0}</div>
          <div>Defesas: {jogador.totalDefesas || 0}</div>
          <div>Cartões amarelos: {jogador.totalCartoesAmarelos || 0}</div>
          <div>Cartões vermelhos: {jogador.totalCartoesVermelhos || 0}</div>
        </div>
      </section>

      {/* ================= VÍDEO ================= */}
      {primeiroVideo && (
        <section className={styles.section}>
          <h2>Melhores momentos</h2>
          <iframe
            src={primeiroVideo}
            title="Melhores momentos"
            frameBorder="0"
            allowFullScreen
          />
        </section>
      )}
    </section>
  );
}
