import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { db } from "../../../services/firebase";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { useAuth } from "../../../services/AuthContext";
import { buscarClube } from "../../../services/firestoreService";
import { sairDoClube } from "../../../services/convitesService";

import styles from "./Jogador.module.css";
import campo2 from "../../../assets/fotos/campo2.png";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import OverallBadge from "../../../components/OverallBadge";
import Loader from "../../../components/Loader";
import {
  getCamisa,
  getClubeId,
  getFoto,
  getPosicao,
  getPresidenteId,
  PLATAFORMAS,
  POSICOES,
  STATUS_LIVRE,
} from "../../../utils/jogador";
import { mediaPorPartida } from "../../../utils/ranking";
import { toast } from "../../../utils/toast";
import {
  comprimirImagem,
  PRESET_AVATAR,
  PRESET_PRINT_ESTATISTICA,
} from "../../../utils/imagem";

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
  const { user } = useAuth();
  const ehProprioPerfil = !!user && user.uid === id;

  // ===============================
  // ESTADOS PRINCIPAIS
  // ===============================
  const [jogador, setJogador] = useState(null);
  const [clube, setClube] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

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
  const [fotoNova, setFotoNova] = useState(""); // data URL já comprimido

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
      setPosicaoPrimariaEdit(getPosicao(jogador));
      setPosicaoSecundariaEdit(jogador.posicaoSecundaria || "");
      setNumeroCamisaEdit(getCamisa(jogador));
      setPlataformaEdit(jogador.plataforma || "");
      setVideoEdit(jogador.video || "");
    } else {
      // cancelar: descarta foto escolhida e volta a original
      setFotoNova("");
      setFotoPreview(getFoto(jogador));
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
      // a foto vai como data URL dentro do próprio documento (sem Storage)
      const fotoUrlFinal = fotoNova || getFoto(jogador);

      const refUsuario = doc(db, "usuarios", jogador.id);

      await updateDoc(refUsuario, {
        nome: nomeEdit,
        bio: bioEdit,
        posicaoPrimaria: posicaoPrimariaEdit,
        posicaoSecundaria: posicaoSecundariaEdit,
        numeroCamisaPessoal: numeroCamisaEdit ? Number(numeroCamisaEdit) : "",
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
        numeroCamisaPessoal: numeroCamisaEdit ? Number(numeroCamisaEdit) : "",
        plataforma: plataformaEdit,
        fotoUrl: fotoUrlFinal,
        video: videoEdit,
      }));

      setEditando(false);
      setFotoNova("");
      toast("Perfil atualizado!");
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      toast("Erro ao salvar perfil.", "erro");
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
    toast("Envie uma foto das estatísticas para podermos validar.", "aviso");
    return;
  }

  setEnviandoStats(true);

  try {
    // 1) Comprime o print (vai como data URL no documento, sem Storage)
    let fotoUrl;
    try {
      fotoUrl = await comprimirImagem(fotoStatsFile, PRESET_PRINT_ESTATISTICA);
    } catch (errImg) {
      toast(errImg.message, "erro");
      return;
    }

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

    toast("Estatísticas enviadas! Assim que o admin aprovar, elas entram no ranking.");

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
    e.target.reset();
  } catch (err) {
    console.error("Erro ao enviar estatísticas:", err);
    toast("Erro ao enviar estatísticas. Tente novamente.", "erro");
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
        setFotoPreview(getFoto(dados));
        setClube(await buscarClube(getClubeId(dados)));
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
    return <Loader texto="Carregando perfil..." />;
  }

  if (erro || !jogador) {
    return (
      <section className={styles.container}>
        <div className={styles.section}>
          <h2>{erro || "Jogador não disponível"}</h2>
          <Link to="/transferencias" className={styles.linkClube}>Voltar ao mercado →</Link>
        </div>
      </section>
    );
  }

  const headerStyle = {
    backgroundImage: `url(${campo2})`,
  };

  // vídeo único (campo atual) ou o primeiro da lista antiga `videos`
  const videoOrigem = jogador.video || (Array.isArray(jogador.videos) ? jogador.videos[0] : "");
  const videoFinal = videoOrigem ? transformarUrlYoutube(videoOrigem) : null;

  const emClube = !!clube;
  const ehPresidenteDoClube = !!clube && getPresidenteId(clube) === jogador.id;
  const partidas = Number(jogador.totalPartidas || 0);

  async function handleSairDoClube() {
    if (!window.confirm(`Sair do ${clube.nome}? Você volta a ficar livre no mercado.`)) return;
    try {
      await sairDoClube(jogador.id);
      setJogador((prev) => ({ ...prev, clubeId: "", status: STATUS_LIVRE }));
      setClube(null);
      toast("Você saiu do clube e está livre no mercado.", "aviso");
    } catch (err) {
      console.error("Erro ao sair do clube:", err);
      toast("Erro ao sair do clube.", "erro");
    }
  }


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
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const dataUrl = await comprimirImagem(file, PRESET_AVATAR);
                    setFotoNova(dataUrl);
                    setFotoPreview(dataUrl);
                  } catch (err) {
                    toast(err.message, "erro");
                  }
                }}
              />
            </label>
          )}
        </div>

        <div className={styles.infoBasica}>
          {!editando ? (
            <>
              <div className={styles.nomeComOverall}>
                <h1>{jogador.nome}</h1>
                <OverallBadge jogador={jogador} size="lg" />
              </div>
              <p className={styles.nomejogador}>@{jogador.username}</p>

              <p className={styles.status}>
                Posição: <span className={styles.posicao}>{getPosicao(jogador) || "N/A"}
                {jogador.posicaoSecundaria &&
                  ` | ${jogador.posicaoSecundaria}`}</span>
              </p>

              <p className={styles.status}>Camisa: <span className={styles.numeroCamisa}>{getCamisa(jogador) || "-"}</span></p>
              <p className={styles.status}>Plataforma: <span className={styles.plataforma}>{jogador.plataforma || "N/A"}</span></p>
              <p className={styles.status}>
                Status:
                <span className={emClube ? styles.statusOcupado : styles.statusLivre} />
                <span className={styles.statusTexto}>
                  {emClube ? (
                    <>
                      {ehPresidenteDoClube ? "Presidente do " : "Joga no "}
                      <Link to={`/clube/${clube.id}`} className={styles.linkClube}>
                        {clube.nome}
                      </Link>
                    </>
                  ) : (
                    "Livre no mercado"
                  )}
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

              <select
                value={posicaoPrimariaEdit}
                onChange={(e) => setPosicaoPrimariaEdit(e.target.value)}
              >
                <option value="">Posição principal</option>
                {POSICOES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={posicaoSecundariaEdit}
                onChange={(e) => setPosicaoSecundariaEdit(e.target.value)}
              >
                <option value="">Sem posição secundária</option>
                {POSICOES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                max="99"
                placeholder="Número da camisa"
                value={numeroCamisaEdit}
                onChange={(e) => setNumeroCamisaEdit(e.target.value)}
              />

              <select
                value={plataformaEdit}
                onChange={(e) => setPlataformaEdit(e.target.value)}
              >
                <option value="">Plataforma</option>
                {PLATAFORMAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

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
            !editando ? (
              <div className={styles.botoesEdicao}>
                <button className={styles.btnEditar} onClick={handleEditarClick}>
                  Editar perfil
                </button>
                {emClube && !ehPresidenteDoClube && (
                  <button className={styles.btnCancelar} onClick={handleSairDoClube}>
                    Sair do clube
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.botoesEdicao}>
                <button
                  className={styles.btnSalvar}
                  onClick={handleSalvar}
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button className={styles.btnCancelar} onClick={handleEditarClick}>
                  Cancelar
                </button>
              </div>
            )
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
          {[
            ["Partidas", jogador.totalPartidas, false],
            ["Gols", jogador.totalGols, true],
            ["Assistências", jogador.totalAssistencias, true],
            ["Desarmes", jogador.totalDesarmes, true],
            ["Defesas", jogador.totalDefesas, true],
            ["Amarelos", jogador.totalCartoesAmarelos, false],
            ["Vermelhos", jogador.totalCartoesVermelhos, false],
          ].map(([label, valor, comMedia]) => (
            <div key={label} className={styles.statCard}>
              <div className={styles.statValue}>{Number(valor || 0)}</div>
              <div className={styles.statLabel}>{label}</div>
              {comMedia && partidas > 0 && (
                <div className={styles.statMedia}>
                  {mediaPorPartida(Number(valor || 0), partidas)} / jogo
                </div>
              )}
            </div>
          ))}
        </div>

        {partidas === 0 && (
          <p className={styles.statAviso}>
            Nenhuma partida aprovada ainda: o overall fica no valor base até a
            primeira aprovação.
          </p>
        )}
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
