// Monta os rankings a partir dos perfis (coleção `usuarios`) e clubes.
// Tudo é calculado no front a partir dos totais já aprovados pelo admin —
// não existe coleção separada de ranking.

import { calcularOverall, getGrupoPosicao, getRaridade } from "./overall";
import { ehJogador, getClubeId, getMembrosClube } from "./jogador";

export const GRUPOS_FILTRO = [
  { id: "todos", label: "Todos" },
  { id: "goleiro", label: "Goleiros" },
  { id: "defesa", label: "Defensores" },
  { id: "meio", label: "Meio-campo" },
  { id: "ataque", label: "Atacantes" },
];

export const CATEGORIAS = [
  {
    id: "overall",
    label: "Overall",
    icone: "⭐",
    titulo: "Melhores do Pro Transfer",
    valor: (j) => j.overall,
    unidade: "OVR",
  },
  {
    id: "gols",
    label: "Artilheiros",
    icone: "⚽",
    titulo: "Artilharia",
    valor: (j) => j.gols,
    unidade: "gols",
  },
  {
    id: "assistencias",
    label: "Assistências",
    icone: "🎯",
    titulo: "Garçons",
    valor: (j) => j.assistencias,
    unidade: "assist.",
  },
  {
    id: "desarmes",
    label: "Desarmes",
    icone: "🛡️",
    titulo: "Muralhas",
    valor: (j) => j.desarmes,
    unidade: "desarmes",
  },
  {
    id: "defesas",
    label: "Defesas",
    icone: "🧤",
    titulo: "Paredões",
    valor: (j) => j.defesas,
    unidade: "defesas",
  },
  {
    id: "clubes",
    label: "Clubes",
    icone: "🏟️",
    titulo: "Clubes mais fortes",
  },
];

const n = (v) => Number(v || 0);

/** Enriquece cada jogador com overall, raridade e totais numéricos. */
export function prepararJogadores(usuarios) {
  return usuarios.filter(ehJogador).map((u) => {
    const overall = calcularOverall(u);
    return {
      ...u,
      overall,
      raridade: getRaridade(overall),
      grupo: getGrupoPosicao(u),
      partidas: n(u.totalPartidas),
      gols: n(u.totalGols),
      assistencias: n(u.totalAssistencias),
      desarmes: n(u.totalDesarmes),
      defesas: n(u.totalDefesas),
      amarelos: n(u.totalCartoesAmarelos),
      vermelhos: n(u.totalCartoesVermelhos),
    };
  });
}

export function mediaPorPartida(total, partidas) {
  if (!partidas) return "0.0";
  return (total / partidas).toFixed(1);
}

/**
 * Ranking de uma categoria. Só entra quem já tem partida aprovada e valor > 0.
 * Desempate: melhor média por partida, depois menos partidas.
 */
export function rankearJogadores(jogadores, categoriaId, grupo = "todos", limite = 20) {
  const categoria = CATEGORIAS.find((c) => c.id === categoriaId);
  if (!categoria?.valor) return [];

  return jogadores
    .filter((j) => j.partidas > 0)
    .filter((j) => grupo === "todos" || j.grupo === grupo)
    .filter((j) => categoria.valor(j) > 0)
    .sort((a, b) => {
      const diff = categoria.valor(b) - categoria.valor(a);
      if (diff !== 0) return diff;
      const mediaDiff = categoria.valor(b) / b.partidas - categoria.valor(a) / a.partidas;
      if (mediaDiff !== 0) return mediaDiff;
      return a.partidas - b.partidas;
    })
    .slice(0, limite);
}

/**
 * Clubes ordenados pelo overall médio dos jogadores do elenco que já têm
 * partidas aprovadas.
 */
export function rankearClubes(clubes, jogadores, limite = 20) {
  return clubes
    .map((clube) => {
      const membros = getMembrosClube(clube, jogadores);
      const avaliados = membros.filter((j) => j.partidas > 0);
      const overallMedio = avaliados.length
        ? Math.round(avaliados.reduce((s, j) => s + j.overall, 0) / avaliados.length)
        : 0;

      return {
        ...clube,
        membros,
        avaliados: avaliados.length,
        overallMedio,
        raridade: getRaridade(overallMedio),
        gols: membros.reduce((s, j) => s + j.gols, 0),
        partidas: avaliados.reduce((s, j) => s + j.partidas, 0),
      };
    })
    .filter((c) => c.avaliados > 0)
    .sort((a, b) => b.overallMedio - a.overallMedio || b.gols - a.gols)
    .slice(0, limite);
}

/** Mapa clubeId -> nome, para mostrar o clube de cada jogador nas listas. */
export function mapaNomesClubes(clubes) {
  return Object.fromEntries(clubes.map((c) => [c.id, c.nome]));
}

export function nomeClubeDoJogador(jogador, nomesClubes) {
  const id = getClubeId(jogador);
  return id ? nomesClubes[id] || "" : "";
}
