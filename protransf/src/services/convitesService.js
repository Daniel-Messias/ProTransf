// Fluxo de transferências: convites entre clube e jogador.
//
// Estrutura de um convite (coleção `convites`):
//   tipo: "clube_para_jogador" | "jogador_para_clube"
//   jogadorId, jogadorUsername, jogadorNome, posicao
//   clubeId, clubeNome, presidenteId
//   status: "pendente" | "aceito" | "recusado"
//   criadoEm, respondidoEm
//
// Quem responde: o jogador (convite do clube) ou o presidente (pedido do jogador).
// Ao aceitar, o jogador passa a ter `clubeId` do clube — é isso que define o
// elenco. As firestore.rules conferem esse vínculo pelo `conviteAceitoId`.

import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  getPosicao,
  getPresidenteId,
  STATUS_EM_CLUBE,
  STATUS_LIVRE,
} from "../utils/jogador";

export const TIPO_CLUBE_PARA_JOGADOR = "clube_para_jogador";
export const TIPO_JOGADOR_PARA_CLUBE = "jogador_para_clube";

/**
 * O usuário é quem deve aceitar/recusar este convite?
 * `clubePresidido` = id do clube que o usuário preside (ou null). Convites
 * antigos não têm `presidenteId`, por isso a checagem é pelo clube.
 */
export function souRespondente(convite, uid, clubePresidido) {
  if (convite.tipo === TIPO_CLUBE_PARA_JOGADOR) return convite.jogadorId === uid;
  return !!clubePresidido && convite.clubeId === clubePresidido;
}

/** Escuta, ao vivo, quantos convites pendentes aguardam resposta do usuário. */
export function ouvirPendentesParaResponder(uid, clubePresidido, callback) {
  const ref = collection(db, "convites");
  const resultados = { jogador: [], clube: [] };

  const emitir = () => {
    const todos = [...resultados.jogador, ...resultados.clube];
    callback(todos.filter((c) => souRespondente(c, uid, clubePresidido)).length);
  };

  const ouvir = (campo, valor, chave) =>
    onSnapshot(
      query(ref, where(campo, "==", valor), where("status", "==", "pendente")),
      (snap) => {
        resultados[chave] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        emitir();
      },
      (err) => console.error("Erro ao ouvir convites:", err)
    );

  const unsubs = [ouvir("jogadorId", uid, "jogador")];
  if (clubePresidido) unsubs.push(ouvir("clubeId", clubePresidido, "clube"));
  return () => unsubs.forEach((u) => u());
}

export async function existeConvitePendente(jogadorId, clubeId) {
  const q = query(
    collection(db, "convites"),
    where("jogadorId", "==", jogadorId),
    where("clubeId", "==", clubeId),
    where("status", "==", "pendente")
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/**
 * Cria um convite. Lança Error com mensagem amigável se já houver um pendente.
 */
export async function enviarConvite({ tipo, jogador, clube }) {
  if (await existeConvitePendente(jogador.id, clube.id)) {
    throw new Error("Já existe um convite pendente entre esse jogador e esse clube.");
  }

  await addDoc(collection(db, "convites"), {
    tipo,
    jogadorId: jogador.id,
    jogadorUsername: jogador.username || "",
    jogadorNome: jogador.nome || jogador.username || "Jogador",
    posicao: getPosicao(jogador),
    clubeId: clube.id,
    clubeNome: clube.nome || "Clube",
    presidenteId: getPresidenteId(clube),
    status: "pendente",
    criadoEm: serverTimestamp(),
  });
}

/**
 * Lista convites em que o usuário é parte: como jogador e, se presidir um
 * clube, como clube.
 */
export async function listarConvitesDoUsuario(uid, clubeIdPresidido) {
  const ref = collection(db, "convites");
  const consultas = [getDocs(query(ref, where("jogadorId", "==", uid)))];
  if (clubeIdPresidido) {
    consultas.push(getDocs(query(ref, where("clubeId", "==", clubeIdPresidido))));
  }

  const snaps = await Promise.all(consultas);
  const porId = new Map();
  snaps.forEach((snap) =>
    snap.docs.forEach((d) => porId.set(d.id, { id: d.id, ...d.data() }))
  );

  return [...porId.values()].sort(
    (a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0)
  );
}

export async function responderConvite(convite, aceitar) {
  const batch = writeBatch(db);

  batch.update(doc(db, "convites", convite.id), {
    status: aceitar ? "aceito" : "recusado",
    respondidoEm: serverTimestamp(),
  });

  if (aceitar) {
    batch.update(doc(db, "usuarios", convite.jogadorId), {
      clubeId: convite.clubeId,
      status: STATUS_EM_CLUBE,
      conviteAceitoId: convite.id,
      atualizadoEm: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function sairDoClube(uid) {
  const batch = writeBatch(db);
  batch.update(doc(db, "usuarios", uid), {
    clubeId: "",
    status: STATUS_LIVRE,
    atualizadoEm: serverTimestamp(),
  });
  await batch.commit();
}

/** Presidente remove um jogador do elenco. */
export async function removerDoClube(clube, jogador) {
  const batch = writeBatch(db);

  // só mexe no perfil se ele realmente aponta pra este clube (as rules exigem isso)
  if (jogador.clubeId === clube.id) {
    batch.update(doc(db, "usuarios", jogador.id), {
      clubeId: "",
      status: STATUS_LIVRE,
      atualizadoEm: serverTimestamp(),
    });
  }

  // limpa também o array `elenco` antigo, se o jogador estiver nele
  const elenco = clube.elenco || [];
  if (elenco.some((e) => e.userId === jogador.id)) {
    batch.update(doc(db, "clubes", clube.id), {
      elenco: elenco.filter((e) => e.userId !== jogador.id),
      atualizadoEm: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function criarClube({ nome, username, plataforma }, uid) {
  const clubeRef = doc(collection(db, "clubes"));
  const batch = writeBatch(db);

  batch.set(clubeRef, {
    nome,
    username,
    plataforma,
    bio: "",
    statusMercado: "aberto",
    presidenteId: uid,
    verificado: false,
    whatsapp: "",
    instagram: "",
    elenco: [],
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  batch.update(doc(db, "usuarios", uid), {
    clubeId: clubeRef.id,
    status: STATUS_EM_CLUBE,
    atualizadoEm: serverTimestamp(),
  });

  await batch.commit();
  return clubeRef.id;
}
