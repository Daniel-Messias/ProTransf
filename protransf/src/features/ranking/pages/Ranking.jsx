import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "../ranking.module.css";

import { buscarClubes, buscarUsuarios } from "../../../services/firestoreService";
import { useAuth } from "../../../services/AuthContext";
import {
  CATEGORIAS,
  GRUPOS_FILTRO,
  mapaNomesClubes,
  mediaPorPartida,
  nomeClubeDoJogador,
  prepararJogadores,
  rankearClubes,
  rankearJogadores,
} from "../../../utils/ranking";
import { getFoto, getNomeExibicao, getSiglaPosicao } from "../../../utils/jogador";
import CardFut from "../../../components/CardFut";
import Loader from "../../../components/Loader";

const MEDALHAS = ["🥇", "🥈", "🥉"];

export default function Ranking() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jogadores, setJogadores] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const categoriaId = CATEGORIAS.some((c) => c.id === searchParams.get("cat"))
    ? searchParams.get("cat")
    : "overall";
  const grupo = GRUPOS_FILTRO.some((g) => g.id === searchParams.get("pos"))
    ? searchParams.get("pos")
    : "todos";

  const categoria = CATEGORIAS.find((c) => c.id === categoriaId);
  const ehClubes = categoriaId === "clubes";

  useEffect(() => {
    async function carregar() {
      try {
        const [usuarios, listaClubes] = await Promise.all([buscarUsuarios(), buscarClubes()]);
        setJogadores(prepararJogadores(usuarios));
        setClubes(listaClubes);
      } catch (e) {
        console.error("Erro ao carregar ranking:", e);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const nomesClubes = useMemo(() => mapaNomesClubes(clubes), [clubes]);

  const ranking = useMemo(
    () =>
      ehClubes
        ? rankearClubes(clubes, jogadores)
        : rankearJogadores(jogadores, categoriaId, grupo),
    [ehClubes, clubes, jogadores, categoriaId, grupo]
  );

  const resumo = useMemo(() => {
    const ativos = jogadores.filter((j) => j.partidas > 0);
    return {
      ranqueados: ativos.length,
      partidas: ativos.reduce((s, j) => s + j.partidas, 0),
      gols: ativos.reduce((s, j) => s + j.gols, 0),
    };
  }, [jogadores]);

  function mudarFiltro(chave, valor) {
    const params = new URLSearchParams(searchParams);
    params.set(chave, valor);
    if (chave === "cat" && valor === "clubes") params.delete("pos");
    setSearchParams(params, { replace: true });
  }

  if (carregando) return <Loader texto="Montando o ranking..." />;

  return (
    <main className={styles.page}>
      {/* ================= HERO ================= */}
      <section className={styles.hero}>
        <span className={styles.badge}>Temporada EA FC</span>
        <h1 className={styles.title}>
          Ranking <span>Pro Transfer</span>
        </h1>
        <p className={styles.text}>
          Calculado a partir das estatísticas aprovadas. O overall usa a{" "}
          <strong>média por partida</strong>, então quem joga bem sobe rápido, sem
          precisar de anos de conta.
        </p>

        <div className={styles.resumo}>
          <div>
            <strong>{resumo.ranqueados}</strong>
            <span>jogadores ranqueados</span>
          </div>
          <div>
            <strong>{resumo.partidas}</strong>
            <span>partidas aprovadas</span>
          </div>
          <div>
            <strong>{resumo.gols}</strong>
            <span>gols marcados</span>
          </div>
        </div>
      </section>

      {/* ================= FILTROS ================= */}
      <nav className={styles.tabs} aria-label="Categorias do ranking">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.tab} ${c.id === categoriaId ? styles.tabAtiva : ""}`}
            onClick={() => mudarFiltro("cat", c.id)}
          >
            <span aria-hidden="true">{c.icone}</span> {c.label}
          </button>
        ))}
      </nav>

      {!ehClubes && (
        <div className={styles.chips} role="group" aria-label="Filtrar por posição">
          {GRUPOS_FILTRO.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`${styles.chip} ${g.id === grupo ? styles.chipAtivo : ""}`}
              onClick={() => mudarFiltro("pos", g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      <h2 className={styles.secaoTitulo}>
        {categoria.icone} {categoria.titulo}
      </h2>

      {erro ? (
        <div className={styles.vazio}>
          <p>Não foi possível carregar o ranking agora. Tente recarregar a página.</p>
        </div>
      ) : ranking.length === 0 ? (
        <div className={styles.vazio}>
          <p>
            {ehClubes
              ? "Nenhum clube com jogadores avaliados ainda."
              : "Ninguém pontuou nessa categoria ainda."}
          </p>
          <span>
            As estatísticas entram no ranking depois de aprovadas pelo admin.
          </span>
          {user && (
            <Link to={`/jogador/${user.uid}`} className={styles.ctaVazio}>
              Enviar minhas estatísticas
            </Link>
          )}
        </div>
      ) : ehClubes ? (
        <ListaClubes clubes={ranking} />
      ) : (
        <>
          <Podio jogadores={ranking.slice(0, 3)} categoria={categoria} />
          <ListaJogadores
            jogadores={ranking.slice(3)}
            inicio={4}
            categoria={categoria}
            nomesClubes={nomesClubes}
            uid={user?.uid}
          />
        </>
      )}
    </main>
  );
}

// ===================================================
// PÓDIO — top 3 em cards FUT (2º, 1º, 3º)
// ===================================================
function Podio({ jogadores, categoria }) {
  const ordemVisual = [1, 0, 2].filter((i) => jogadores[i]);

  return (
    <div className={styles.podio}>
      {ordemVisual.map((i) => {
        const j = jogadores[i];
        const valor = categoria.valor(j);
        return (
          <div key={j.id} className={`${styles.degrau} ${styles[`lugar${i + 1}`]}`}>
            <span className={styles.medalha}>{MEDALHAS[i]}</span>
            <CardFut jogador={j} tamanho={i === 0 ? "lg" : "md"} destaque={i === 0} />
            <div className={styles.podioValor}>
              <strong>{valor}</strong> {categoria.unidade}
            </div>
            <div className={styles.podioSub}>
              {categoria.id === "overall"
                ? `${j.partidas} partida${j.partidas === 1 ? "" : "s"}`
                : `${mediaPorPartida(valor, j.partidas)} por jogo`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===================================================
// LISTA — do 4º em diante
// ===================================================
function ListaJogadores({ jogadores, inicio, categoria, nomesClubes, uid }) {
  if (jogadores.length === 0) return null;

  return (
    <ol className={styles.lista} start={inicio}>
      {jogadores.map((j, idx) => {
        const valor = categoria.valor(j);
        const foto = getFoto(j);
        const nome = getNomeExibicao(j);
        const clube = nomeClubeDoJogador(j, nomesClubes);

        return (
          <li key={j.id}>
            <Link
              to={`/jogador/${j.id}`}
              className={`${styles.linha} ${j.id === uid ? styles.voce : ""}`}
            >
              <span className={styles.pos}>{inicio + idx}</span>

              <span
                className={styles.avatar}
                style={{ "--cor-raridade": j.raridade.corPrincipal }}
              >
                {foto ? <img src={foto} alt="" /> : nome.charAt(0)}
              </span>

              <span className={styles.identidade}>
                <span className={styles.nome}>
                  {nome}
                  {j.id === uid && <em className={styles.tagVoce}>Você</em>}
                </span>
                <span className={styles.meta}>
                  {j.username ? `@${j.username}` : ""}
                  {clube && ` · ${clube}`}
                </span>
              </span>

              <span className={styles.sigla}>{getSiglaPosicao(j)}</span>

              <span className={styles.valor}>
                <strong>{valor}</strong>
                <small>
                  {categoria.id === "overall"
                    ? `${j.partidas} PJ`
                    : `${mediaPorPartida(valor, j.partidas)}/jogo`}
                </small>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function ListaClubes({ clubes }) {
  return (
    <ol className={styles.lista}>
      {clubes.map((c, idx) => (
        <li key={c.id}>
          <Link to={`/clube/${c.id}`} className={`${styles.linha} ${styles.linhaClube}`}>
            <span className={styles.pos}>{MEDALHAS[idx] || idx + 1}</span>

            <span
              className={styles.avatar}
              style={{ "--cor-raridade": c.raridade.corPrincipal }}
            >
              {(c.nome || "C").charAt(0)}
            </span>

            <span className={styles.identidade}>
              <span className={styles.nome}>
                {c.nome}
                {c.verificado && <em className={styles.tagVerificado}>✔ Verificado</em>}
              </span>
              <span className={styles.meta}>
                {c.membros.length} jogador{c.membros.length === 1 ? "" : "es"} ·{" "}
                {c.gols} gols · {c.plataforma || "—"}
              </span>
            </span>

            <span className={styles.valor}>
              <strong>{c.overallMedio}</strong>
              <small>OVR médio</small>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
