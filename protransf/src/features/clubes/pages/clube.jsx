import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import styles from "./Clube.module.css";

import { db } from "../../../services/firebase";
import { useAuth } from "../../../services/AuthContext";
import { buscarClube, buscarUsuarios } from "../../../services/firestoreService";
import {
  criarClube,
  enviarConvite,
  removerDoClube,
  TIPO_JOGADOR_PARA_CLUBE,
} from "../../../services/convitesService";
import {
  clubeBuscandoJogadores,
  ehJogador,
  getCamisa,
  getMembrosClube,
  getPresidenteId,
  PLATAFORMAS,
} from "../../../utils/jogador";
import { prepararJogadores } from "../../../utils/ranking";
import { getRaridade } from "../../../utils/overall";
import { toast } from "../../../utils/toast";
import CardFut from "../../../components/CardFut";
import Loader from "../../../components/Loader";

export default function Clube() {
  const { id } = useParams();
  const { user, clube } = useAuth();

  // /clube sem id: redireciona para o clube do usuário ou mostra "criar clube"
  if (!id) {
    if (!user) return <Navigate to="/login" replace />;
    if (clube === undefined) return <Loader texto="Carregando clube..." />;
    if (clube) return <Navigate to={`/clube/${clube.id}`} replace />;
    return <CriarClube />;
  }

  return <PaginaClube key={id} id={id} />;
}

// ===================================================
// CRIAR CLUBE
// ===================================================
function CriarClube() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [plataforma, setPlataforma] = useState("PlayStation");
  const [criando, setCriando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim() || !username.trim()) {
      toast("Preencha nome e username do clube.", "aviso");
      return;
    }

    setCriando(true);
    try {
      const novoId = await criarClube(
        { nome: nome.trim(), username: username.trim().replace(/^@/, ""), plataforma },
        user.uid
      );
      toast("Clube criado! Agora é só montar o elenco.");
      navigate(`/clube/${novoId}`, { replace: true });
    } catch (err) {
      console.error("Erro ao criar clube:", err);
      toast("Erro ao criar clube. Tente novamente.", "erro");
      setCriando(false);
    }
  }

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>Criar meu clube</h1>
        <p className={styles.subtitle}>
          Você vira presidente: convida jogadores pelo mercado e aprova pedidos de entrada.
        </p>
      </section>

      <section className={styles.section}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Nome do clube
            <input
              className={styles.input}
              placeholder="Ex: The Horse FC"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={40}
            />
          </label>

          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              placeholder="Ex: thehorsefc"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
            />
          </label>

          <label className={styles.label}>
            Plataforma
            <select
              className={styles.select}
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
            >
              {PLATAFORMAS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <button className={styles.saveBtn} type="submit" disabled={criando}>
            {criando ? "Criando clube..." : "Criar clube"}
          </button>
        </form>
      </section>
    </main>
  );
}

// ===================================================
// PÁGINA DO CLUBE
// ===================================================
function PaginaClube({ id }) {
  const { user, perfil } = useAuth();

  const [clube, setClube] = useState(null);
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [pedindo, setPedindo] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [dadosClube, usuarios] = await Promise.all([buscarClube(id), buscarUsuarios()]);
      setClube(dadosClube);
      if (dadosClube) {
        setMembros(prepararJogadores(getMembrosClube(dadosClube, usuarios)));
      }
    } catch (error) {
      console.error("Erro ao buscar clube:", error);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const presidenteId = getPresidenteId(clube);
  const isPresidente = !!user && user.uid === presidenteId;

  const resumo = useMemo(() => {
    const avaliados = membros.filter((m) => m.partidas > 0);
    const overallMedio = avaliados.length
      ? Math.round(avaliados.reduce((s, m) => s + m.overall, 0) / avaliados.length)
      : null;
    return {
      overallMedio,
      gols: membros.reduce((s, m) => s + m.gols, 0),
    };
  }, [membros]);

  // camisa vinda do array `elenco` antigo tem prioridade sobre a do perfil
  const camisaPorId = useMemo(
    () => Object.fromEntries((clube?.elenco || []).map((e) => [e.userId, e.camisa])),
    [clube]
  );

  if (carregando) return <Loader texto="Carregando clube..." />;

  if (!clube) {
    return (
      <main className={styles.container}>
        <section className={styles.section}>
          <h2>Clube não encontrado</h2>
          <p className={styles.muted}>
            Esse clube pode ter sido removido. <Link to="/transferencias">Voltar ao mercado</Link>
          </p>
        </section>
      </main>
    );
  }

  const souMembro = membros.some((m) => m.id === user?.uid);
  const podePedir =
    !!user && ehJogador(perfil) && !souMembro && clubeBuscandoJogadores(clube);

  function iniciarEdicao() {
    setForm({
      bio: clube.bio || "",
      statusMercado: clube.statusMercado || (clube.estaBuscando ? "aberto" : "fechado"),
      whatsapp: clube.whatsapp || "",
      instagram: clube.instagram || "",
    });
    setEditando(true);
  }

  async function salvarAlteracoes() {
    setSalvando(true);
    try {
      await updateDoc(doc(db, "clubes", clube.id), {
        ...form,
        atualizadoEm: serverTimestamp(),
      });
      setClube((prev) => ({ ...prev, ...form }));
      setEditando(false);
      toast("Alterações salvas!");
    } catch (error) {
      console.error("Erro ao salvar clube:", error);
      toast("Erro ao salvar alterações.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(jogador) {
    if (!window.confirm(`Remover ${jogador.nome || jogador.username} do elenco?`)) return;
    try {
      await removerDoClube(clube, jogador);
      toast("Jogador removido do elenco.", "aviso");
      carregar();
    } catch (error) {
      console.error("Erro ao remover jogador:", error);
      toast("Erro ao remover jogador.", "erro");
    }
  }

  async function pedirParaEntrar() {
    setPedindo(true);
    try {
      await enviarConvite({ tipo: TIPO_JOGADOR_PARA_CLUBE, jogador: perfil, clube });
      toast("Pedido enviado ao presidente!");
    } catch (error) {
      toast(error.message || "Erro ao enviar pedido.", "erro");
    } finally {
      setPedindo(false);
    }
  }

  const aberto = clubeBuscandoJogadores(clube);
  const corOvr = resumo.overallMedio ? getRaridade(resumo.overallMedio).corPrincipal : null;

  // presidente primeiro, depois por overall
  const elencoOrdenado = [...membros].sort(
    (a, b) => (b.id === presidenteId) - (a.id === presidenteId) || b.overall - a.overall
  );

  return (
    <main className={styles.container}>
      {/* ================= HEADER ================= */}
      <section className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.identidade}>
            <div className={styles.escudo}>{(clube.nome || "C").charAt(0)}</div>
            <div>
              <h1 className={styles.title}>
                {clube.nome}
                {clube.verificado && <span className={styles.badge}>✔ Verificado</span>}
              </h1>
              <p className={styles.subtitle}>
                @{clube.username} • {clube.plataforma}
              </p>
              <span className={aberto ? styles.mercadoAberto : styles.mercadoFechado}>
                {aberto ? "Buscando jogadores" : "Mercado fechado"}
              </span>
            </div>
          </div>

          <div className={styles.headerAcoes}>
            {isPresidente &&
              (editando ? (
                <button className={styles.ghostBtn} onClick={() => setEditando(false)}>
                  Cancelar
                </button>
              ) : (
                <button className={styles.editBtn} onClick={iniciarEdicao}>
                  Editar clube
                </button>
              ))}

            {podePedir && (
              <button className={styles.editBtn} onClick={pedirParaEntrar} disabled={pedindo}>
                {pedindo ? "Enviando..." : "Pedir para entrar"}
              </button>
            )}
          </div>
        </div>

        <div className={styles.numeros}>
          <div>
            <strong>{membros.length}</strong>
            <span>jogadores</span>
          </div>
          <div>
            <strong style={corOvr ? { color: corOvr } : undefined}>
              {resumo.overallMedio ?? "—"}
            </strong>
            <span>OVR médio</span>
          </div>
          <div>
            <strong>{resumo.gols}</strong>
            <span>gols</span>
          </div>
        </div>
      </section>

      {/* ================= EDIÇÃO ================= */}
      {editando && (
        <section className={styles.section}>
          <h2>Editar clube</h2>
          <div className={styles.form}>
            <label className={styles.label}>
              Sobre o clube
              <textarea
                className={styles.textarea}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </label>

            <label className={styles.label}>
              Status no mercado
              <select
                className={styles.select}
                value={form.statusMercado}
                onChange={(e) => setForm({ ...form, statusMercado: e.target.value })}
              >
                <option value="aberto">Aberto — buscando jogadores</option>
                <option value="fechado">Fechado</option>
              </select>
            </label>

            <div className={styles.duasColunas}>
              <label className={styles.label}>
                WhatsApp
                <input
                  className={styles.input}
                  placeholder="(11) 99999-9999"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Instagram
                <input
                  className={styles.input}
                  placeholder="@seuclube"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                />
              </label>
            </div>

            <button className={styles.saveBtn} onClick={salvarAlteracoes} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </section>
      )}

      {/* ================= SOBRE ================= */}
      {!editando && (
        <section className={styles.section}>
          <h2>Sobre o clube</h2>
          <p className={clube.bio ? undefined : styles.muted}>{clube.bio || "Sem descrição."}</p>

          {(clube.whatsapp || clube.instagram) && (
            <div className={styles.contatos}>
              {clube.instagram && (
                <a
                  href={`https://instagram.com/${clube.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram /> {clube.instagram}
                </a>
              )}
              {clube.whatsapp && (
                <a
                  href={`https://wa.me/${clube.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {/* ================= ELENCO ================= */}
      <section className={styles.section}>
        <div className={styles.secaoTopo}>
          <h2>Elenco</h2>
          {isPresidente && (
            <Link to="/transferencias" className={styles.linkMercado}>
              + Contratar no mercado
            </Link>
          )}
        </div>

        {elencoOrdenado.length === 0 ? (
          <p className={styles.muted}>Nenhum jogador no elenco ainda.</p>
        ) : (
          <div className={styles.elencoGrid}>
            {elencoOrdenado.map((jogador) => {
              const camisa = camisaPorId[jogador.id] || getCamisa(jogador);
              const ehPresidenteCard = jogador.id === presidenteId;
              return (
                <div key={jogador.id} className={styles.jogadorSlot}>
                  <CardFut
                    jogador={jogador}
                    tamanho="sm"
                    rodape={ehPresidenteCard ? "Presidente" : camisa ? `Camisa ${camisa}` : null}
                  />
                  {editando && isPresidente && !ehPresidenteCard && (
                    <button className={styles.removeBtn} onClick={() => remover(jogador)}>
                      Remover
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
