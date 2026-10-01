// Helpers para ler dados de usuários/clubes de forma consistente.
//
// Ao longo do tempo o app gravou o mesmo dado com nomes diferentes
// (ex: `posicao` x `posicaoPrimaria`, `fotoURL` x `fotoUrl`). Em vez de
// espalhar `a || b` pelo código, toda tela lê pelos helpers abaixo.

export const POSICOES = [
  "Goleiro",
  "Zagueiro",
  "Lateral Direito",
  "Lateral Esquerdo",
  "Volante",
  "Meia",
  "Atacante",
  "Ponta Direita",
  "Ponta Esquerda",
];

export const PLATAFORMAS = ["PlayStation", "Xbox", "PC"];

export const STATUS_LIVRE = "Livre";
export const STATUS_EM_CLUBE = "em_clube";

export function ehJogador(usuario) {
  return usuario?.tipo === "jogador" || usuario?.tipo === "clube_jogador";
}

export function getPosicao(usuario) {
  return usuario?.posicaoPrimaria || usuario?.posicao || "";
}

const SIGLAS_POSICAO = {
  Goleiro: "GOL",
  Zagueiro: "ZAG",
  "Lateral Direito": "LD",
  "Lateral Esquerdo": "LE",
  Lateral: "LAT",
  Volante: "VOL",
  Meia: "MEI",
  "Meio Campo": "MC",
  "Meio-campo": "MC",
  Atacante: "ATA",
  "Ponta Direita": "PD",
  "Ponta Esquerda": "PE",
};

export function getSiglaPosicao(usuario) {
  const pos = getPosicao(usuario);
  return SIGLAS_POSICAO[pos] || (pos ? pos.slice(0, 3).toUpperCase() : "—");
}

export function getFoto(usuario) {
  return usuario?.fotoUrl || usuario?.fotoURL || "";
}

export function getClubeId(usuario) {
  return usuario?.clubeId || usuario?.clubeAtualId || "";
}

export function getNomeExibicao(usuario) {
  return usuario?.nome || usuario?.username || "Jogador";
}

export function getCamisa(usuario) {
  return usuario?.numeroCamisaPessoal || usuario?.numeroCamisa || "";
}

export function estaEmClube(usuario) {
  const status = String(usuario?.status || "").toLowerCase();
  return status === STATUS_EM_CLUBE || status === "contratado";
}

// ---------- clubes ----------

export function getPresidenteId(clube) {
  return clube?.presidenteId || clube?.donoUid || clube?.criadoPorUsuarioId || "";
}

export function clubeBuscandoJogadores(clube) {
  if (clube?.statusMercado) return clube.statusMercado === "aberto";
  return !!clube?.estaBuscando;
}

/**
 * Ids de todos que estão no elenco de algum clube que existe. Mais confiável
 * que o campo `status` (há perfis "Contratado" em clubes que já foram apagados).
 */
export function idsComClube(clubes, usuarios) {
  const ids = new Set();
  clubes.forEach((c) => getMembrosClube(c, usuarios).forEach((u) => ids.add(u.id)));
  return ids;
}

// Membros = jogadores com clubeId apontando pro clube + entradas antigas
// do array `elenco` (que era editado à mão pelo presidente).
export function getMembrosClube(clube, usuarios) {
  const idsElenco = new Set((clube?.elenco || []).map((e) => e.userId));
  return usuarios.filter(
    (u) => getClubeId(u) === clube.id || idsElenco.has(u.id)
  );
}
