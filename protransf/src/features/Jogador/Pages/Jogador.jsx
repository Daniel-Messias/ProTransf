import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { db, auth } from "../../../services/firebase";
import { doc, getDoc, updateDoc,collection, addDoc } from "firebase/firestore";
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
  const [videoEdit, setVideoEdit] = useState("");


  // ===============================
  // FOTO
  // ===============================
  const [fotoPreview, setFotoPreview] = useState("");
  const [fotoFile, setFotoFile] = useState(null);

// ===============================
// FORMULÁRIO DE ESTATÍSTICAS
// ===============================
const [golsPartida, setGolsPartida] = useState("");
const [assistenciasPartida, setAssistenciasPartida] = useState("");
const [desarmesPartida, setDesarmesPartida] = useState("");
const [defesasPartida, setDefesasPartida] = useState("");
const [amarelosPartida, setAmarelosPartida] = useState("");
const [vermelhosPartida, setVermelhosPartida] = useState("");
const [dataPartida, setDataPartida] = useState("");
const [observacoesPartida, setObservacoesPartida] = useState("");

const [fotoStatsFile, setFotoStatsFile] = useState(null);
const [enviandoStats, setEnviandoStats] = useState(false);

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
      setVideoEdit(jogador.video || "");

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
        video: videoEdit,
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
        video: videoEdit,
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
// ENVIAR ESTATÍSTICAS DA PARTIDA
// ===============================
async function handleEnviarEstatisticas(e) {
  e.preventDefault();
  if (!jogador) return;

  // Foto obrigatória
  if (!fotoStatsFile) {
    alert("Envie uma foto das estatísticas para podermos validar.");
    return;
  }

  setEnviandoStats(true);

  try {
    // 1) Upload da foto para o Storage
   const pasta = `fotosJogadores`;

    const nomeArquivo = `${Date.now()}-${fotoStatsFile.name}`;
    const storageRef = ref(storage, `${pasta}/${nomeArquivo}`);

    await uploadBytes(storageRef, fotoStatsFile);
    const fotoUrl = await getDownloadURL(storageRef);

    // 2) Criar documento em solicitacoesEstatisticas com status pendente
    const colecao = collection(db, "solicitacoesEstatisticas");
    await addDoc(colecao, {
      jogadorId: jogador.id,
      gols: Number(golsPartida) || 0,
      assistencias: Number(assistenciasPartida) || 0,
      desarmes: Number(desarmesPartida) || 0,
      defesas: Number(defesasPartida) || 0,
      amarelos: Number(amarelosPartida) || 0,
      vermelhos: Number(vermelhosPartida) || 0,
      dataPartida: dataPartida || null,
      observacoes: observacoesPartida || "",
      fotoUrl,
      status: "pendente",
      criadoEm: new Date(),
    });

    alert("Estatísticas enviadas para revisão. Aguarde aprovação.");

    // 3) Limpar formulário
    setGolsPartida("");
    setAssistenciasPartida("");
    setDesarmesPartida("");
    setDefesasPartida("");
    setAmarelosPartida("");
    setVermelhosPartida("");
    setDataPartida("");
    setObservacoesPartida("");
    setFotoStatsFile(null);
  } catch (err) {
    console.error("Erro ao enviar estatísticas:", err);
    alert("Erro ao enviar estatísticas. Tente novamente.");
  } finally {
    setEnviandoStats(false);
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
    return (
      <section className={styles.container}>Jogador não disponível</section>
    );
  }

  const primeiroVideo =
    Array.isArray(jogador.videos) && jogador.videos.length > 0
      ? transformarUrlYoutube(jogador.videos[0])
      : null;

  const headerStyle = {
    backgroundImage: `url(${campo2})`,
  };
  const videoFinal = jogador.video
  ? transformarUrlYoutube(jogador.video)
  : null;


  return (
    <section className={styles.container}>
      {/* ================= HEADER ================= */}
      <header className={styles.header} style={headerStyle}>
        <div className={styles.cardFoto}>
          {fotoPreview ? (
            <img
              src={fotoPreview}
              alt={jogador.nome}
              className={styles.fotoJogador}
            />
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
              <p className={styles.nomejogador}>@{jogador.username}</p>

              <p className={styles.status}>
                Posição: <spam className={styles.posicao}>{jogador.posicaoPrimaria || "N/A"}
                {jogador.posicaoSecundaria &&
                  ` | ${jogador.posicaoSecundaria}`}</spam>
              </p>

              <p className={styles.status}>Camisa: <spam className={styles.numeroCamisa}>{jogador.numeroCamisaPessoal || "-"}</spam></p>
              <p className={styles.status}>Plataforma: <spam className={styles.plataforma}>{jogador.plataforma || "N/A"}</spam></p>
              <p className={styles.status}>
  Status:
  <span
    className={
      jogador.status === "em_clube"
        ? styles.statusOcupado
        : styles.statusLivre
    }
  />
  <span className={styles.statusTexto}>
    {jogador.status === "em_clube"
      ? "Contratado"
      : "Livre no mercado"}
  </span>
</p>


            </>
          ) : (
            <div className={styles.formEdicao}>
              <input
                placeholder="Nome"
                value={nomeEdit}
                onChange={(e) => setNomeEdit(e.target.value)}
              />

              <textarea
                placeholder="Bio"
                value={bioEdit}
                onChange={(e) => setBioEdit(e.target.value)}
              />

              <input
                placeholder="Posição principal"
                value={posicaoPrimariaEdit}
                onChange={(e) => setPosicaoPrimariaEdit(e.target.value)}
              />

              <input
                placeholder="Posição secundária"
                value={posicaoSecundariaEdit}
                onChange={(e) => setPosicaoSecundariaEdit(e.target.value)}
              />

              <input
                type="number"
                placeholder="Número da camisa"
                value={numeroCamisaEdit}
                onChange={(e) => setNumeroCamisaEdit(e.target.value)}
              />

              <input
                placeholder="Plataforma"
                value={plataformaEdit}
                onChange={(e) => setPlataformaEdit(e.target.value)}
              />
              <input
              placeholder="Link do vídeo (YouTube)"
              value={videoEdit}
              onChange={(e) => setVideoEdit(e.target.value)}
              />

            </div>
          )}

          {(jogador.instagram || jogador.whatsapp) && !editando && (
            <div className={styles.contatos}>
              {jogador.instagram && (
                <a
                className={styles.iconeRede}
                href={`https://instagram.com/${jogador.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                >
                  <FaInstagram />
                  </a>

              )}

              {jogador.whatsapp && (
                <a
                className={styles.iconeRede}
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
                <button className={styles.btnEditar} onClick={handleEditarClick}>Editar perfil</button>

              ) : (
                <div className={styles.botoesEdicao}>
  <button
    className={styles.btnSalvar}
    onClick={handleSalvar}
    disabled={salvando}
  >
    {salvando ? "Salvando..." : "Salvar"}
  </button>

  <button
    className={styles.btnCancelar}
    onClick={handleEditarClick}
  >
    Cancelar
  </button>
</div>

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
  <div className={styles.statCard}>
    <div className={styles.statValue}>{jogador.totalGols || 0}</div>
    <div className={styles.statLabel}>Gols</div>
  </div>

  <div className={styles.statCard}>
    <div className={styles.statValue}>{jogador.totalAssistencias || 0}</div>
    <div className={styles.statLabel}>Assistências</div>
  </div>

  <div className={styles.statCard}>
    <div className={styles.statValue}>{jogador.totalDesarmes || 0}</div>
    <div className={styles.statLabel}>Desarmes</div>
  </div>

  <div className={styles.statCard}>
    <div className={styles.statValue}>{jogador.totalDefesas || 0}</div>
    <div className={styles.statLabel}>Defesas</div>
  </div>

  <div className={styles.statCard}>
    <div className={styles.statValue}>{jogador.totalCartoesAmarelos || 0}</div>
    <div className={styles.statLabel}>Amarelos</div>
  </div>

  <div className={styles.statCard}>
    <div className={styles.statValue}>{jogador.totalCartoesVermelhos || 0}</div>
    <div className={styles.statLabel}>Vermelhos</div>
  </div>
</div>

      </section>

      {ehProprioPerfil && (
  <section className={styles.section}>
    <h2>Enviar estatísticas de partida</h2>

    <form className={styles.formStats} onSubmit={handleEnviarEstatisticas}>
      <div className={styles.gridStatsForm}>
        <div className={styles.campo}>
          <label>Data da partida</label>
          <input
            type="date"
            value={dataPartida}
            onChange={(e) => setDataPartida(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label>Gols</label>
          <input
            type="number"
            min="0"
            value={golsPartida}
            onChange={(e) => setGolsPartida(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label>Assistências</label>
          <input
            type="number"
            min="0"
            value={assistenciasPartida}
            onChange={(e) => setAssistenciasPartida(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label>Desarmes</label>
          <input
            type="number"
            min="0"
            value={desarmesPartida}
            onChange={(e) => setDesarmesPartida(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label>Defesas</label>
          <input
            type="number"
            min="0"
            value={defesasPartida}
            onChange={(e) => setDefesasPartida(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label>Cartões amarelos</label>
          <input
            type="number"
            min="0"
            value={amarelosPartida}
            onChange={(e) => setAmarelosPartida(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label>Cartões vermelhos</label>
          <input
            type="number"
            min="0"
            value={vermelhosPartida}
            onChange={(e) => setVermelhosPartida(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.campo}>
        <label>Observações (opcional)</label>
        <textarea
          rows={3}
          value={observacoesPartida}
          onChange={(e) => setObservacoesPartida(e.target.value)}
        />
      </div>

      <div className={styles.campo}>
        <label>Foto das estatísticas (obrigatória)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFotoStatsFile(file || null);
          }}
        />
      </div>

      <button
        type="submit"
        className={styles.btnSalvar}
        disabled={enviandoStats}
      >
        {enviandoStats ? "Enviando..." : "Enviar para revisão"}
      </button>
    </form>
  </section>
)}


      {/* ================= VÍDEO ================= */}
      {videoFinal && (
  <section className={styles.section}>
    <h2>Melhores momentos</h2>

    <div className={styles.videoWrapper}>
      <iframe
        src={videoFinal}
        title="Melhores momentos"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  </section>
)}

    
    </section>
  );
}
