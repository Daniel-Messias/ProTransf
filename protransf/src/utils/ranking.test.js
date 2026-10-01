import { calcularOverall, getRaridade } from "./overall";
import { prepararJogadores, rankearClubes, rankearJogadores } from "./ranking";
import { getPosicao, getMembrosClube } from "./jogador";

const jogador = (id, extra = {}) => ({
  id,
  tipo: "jogador",
  nome: id,
  posicaoPrimaria: "Atacante",
  ...extra,
});

describe("overall", () => {
  test("sem partidas fica no valor base", () => {
    expect(calcularOverall(jogador("a"))).toBe(62);
  });

  test("usa média por partida, não total bruto", () => {
    const veterano = jogador("v", { totalPartidas: 100, totalGols: 50 });
    const novato = jogador("n", { totalPartidas: 2, totalGols: 4 });
    expect(calcularOverall(novato)).toBeGreaterThan(calcularOverall(veterano));
  });

  test("cartões penalizam", () => {
    const limpo = jogador("l", { totalPartidas: 5, totalGols: 5 });
    const sujo = { ...limpo, totalCartoesVermelhos: 5 };
    expect(calcularOverall(sujo)).toBeLessThan(calcularOverall(limpo));
  });

  test("fica entre 40 e 99", () => {
    const monstro = jogador("m", { totalPartidas: 1, totalGols: 500, totalAssistencias: 500 });
    expect(calcularOverall(monstro)).toBe(99);
  });

  test("lê posição do campo antigo `posicao`", () => {
    const antigo = { id: "x", tipo: "jogador", posicao: "Goleiro", totalPartidas: 2, totalDefesas: 10 };
    expect(getPosicao(antigo)).toBe("Goleiro");
    // goleiro valoriza defesas: tem que passar do base
    expect(calcularOverall(antigo)).toBeGreaterThan(62);
  });

  test("raridade por faixa", () => {
    expect(getRaridade(65).id).toBe("bronze");
    expect(getRaridade(75).id).toBe("prata");
    expect(getRaridade(85).id).toBe("ouro");
    expect(getRaridade(95).id).toBe("especial");
  });
});

describe("ranking", () => {
  const usuarios = [
    jogador("a", { totalPartidas: 4, totalGols: 8, clubeId: "c1" }),
    jogador("b", { totalPartidas: 2, totalGols: 8 }),
    jogador("c", { totalPartidas: 3, totalGols: 1, posicaoPrimaria: "Zagueiro", totalDesarmes: 15 }),
    jogador("semJogos"),
    { id: "clubeSo", tipo: "clube" },
  ];
  const jogadores = prepararJogadores(usuarios);

  test("ignora quem não é jogador", () => {
    expect(jogadores.map((j) => j.id)).not.toContain("clubeSo");
  });

  test("artilharia desempata pela melhor média", () => {
    const ranking = rankearJogadores(jogadores, "gols");
    expect(ranking.map((j) => j.id)).toEqual(["b", "a", "c"]);
  });

  test("quem não tem partida aprovada não entra", () => {
    const ranking = rankearJogadores(jogadores, "overall");
    expect(ranking.map((j) => j.id)).not.toContain("semJogos");
  });

  test("filtro por grupo de posição", () => {
    const defensores = rankearJogadores(jogadores, "desarmes", "defesa");
    expect(defensores.map((j) => j.id)).toEqual(["c"]);
  });

  test("clubes: membros por clubeId e pelo array elenco antigo", () => {
    const clubes = [
      { id: "c1", nome: "Um", elenco: [{ userId: "b", camisa: 9 }] },
      { id: "c2", nome: "Vazio" },
    ];
    expect(getMembrosClube(clubes[0], jogadores).map((j) => j.id).sort()).toEqual(["a", "b"]);

    const ranking = rankearClubes(clubes, jogadores);
    expect(ranking).toHaveLength(1);
    expect(ranking[0].id).toBe("c1");
    expect(ranking[0].gols).toBe(16);
  });
});
