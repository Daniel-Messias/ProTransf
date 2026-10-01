// Calcula um "overall" (0-99) estilo FUT a partir das estatísticas do jogador.
//
// IMPORTANTE: o cálculo é feito por MÉDIA POR PARTIDA (jogador.totalPartidas),
// não pelo total bruto — assim um jogador com poucos jogos mas bom desempenho
// não fica atrás de alguém que só acumulou números por estar há mais tempo
// registrado. Se totalPartidas ainda não existir (jogador sem estatística
// aprovada ainda), devolve um overall base neutro.

import { getPosicao } from "./jogador";

const GRUPOS_POSICAO = {
  Goleiro: "goleiro",
  Zagueiro: "defesa",
  "Lateral Direito": "defesa",
  "Lateral Esquerdo": "defesa",
  Volante: "meio",
  Meia: "meio",
  Atacante: "ataque",
  "Ponta Direita": "ataque",
  "Ponta Esquerda": "ataque",
  // nomes antigos, ainda presentes em perfis cadastrados antes da padronização
  Lateral: "defesa",
  "Meio Campo": "meio",
  "Meio-campo": "meio",
};

export function getGrupoPosicao(jogador) {
  return GRUPOS_POSICAO[getPosicao(jogador)] || "meio";
}

// Pesos por grupo de posição: o quanto cada estatística por partida
// contribui para o overall daquele tipo de jogador.
const PESOS = {
  goleiro: { defesas: 6, desarmes: 1.5, gols: 0.5, assistencias: 0.5 },
  defesa: { desarmes: 4, defesas: 1.5, gols: 1, assistencias: 1.5 },
  meio: { gols: 2.5, assistencias: 3, desarmes: 2 },
  ataque: { gols: 4, assistencias: 2.5, desarmes: 0.5 },
};

const OVERALL_BASE = 62; // ponto de partida para quem ainda não tem partidas registradas
const OVERALL_MIN = 40;
const OVERALL_MAX = 99;

function clamp(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}

// Crescimento com retorno decrescente: as primeiras partidas valem mais
// que as próximas, pra não deixar o overall subir infinito com o tempo.
function contribuicao(mediaPorPartida, peso) {
  return Math.sqrt(mediaPorPartida) * peso * 4;
}

export function calcularOverall(jogador = {}) {
  const partidas = Number(jogador.totalPartidas || 0);

  if (partidas <= 0) {
    return OVERALL_BASE;
  }

  const pesos = PESOS[getGrupoPosicao(jogador)];

  const golsPorPartida = Number(jogador.totalGols || 0) / partidas;
  const assistPorPartida = Number(jogador.totalAssistencias || 0) / partidas;
  const desarmesPorPartida = Number(jogador.totalDesarmes || 0) / partidas;
  const defesasPorPartida = Number(jogador.totalDefesas || 0) / partidas;

  let overall = OVERALL_BASE;

  if (pesos.gols) overall += contribuicao(golsPorPartida, pesos.gols);
  if (pesos.assistencias) overall += contribuicao(assistPorPartida, pesos.assistencias);
  if (pesos.desarmes) overall += contribuicao(desarmesPorPartida, pesos.desarmes);
  if (pesos.defesas) overall += contribuicao(defesasPorPartida, pesos.defesas);

  // Penalidade leve por cartões (indisciplina)
  const amarelosPorPartida = Number(jogador.totalCartoesAmarelos || 0) / partidas;
  const vermelhosPorPartida = Number(jogador.totalCartoesVermelhos || 0) / partidas;
  overall -= amarelosPorPartida * 2;
  overall -= vermelhosPorPartida * 6;

  return Math.round(clamp(overall, OVERALL_MIN, OVERALL_MAX));
}

// Raridade estilo FUT baseada na faixa do overall.
export function getRaridade(overall) {
  if (overall >= 90) {
    return {
      id: "especial",
      label: "Especial",
      corPrincipal: "#22d3c5",
      corSecundaria: "#a855f7",
    };
  }
  if (overall >= 80) {
    return {
      id: "ouro",
      label: "Ouro",
      corPrincipal: "#ffd75e",
      corSecundaria: "#b8860b",
    };
  }
  if (overall >= 70) {
    return {
      id: "prata",
      label: "Prata",
      corPrincipal: "#e4e7ec",
      corSecundaria: "#9aa1b4",
    };
  }
  return {
    id: "bronze",
    label: "Bronze",
    corPrincipal: "#cd8b52",
    corSecundaria: "#8a5a2e",
  };
}
