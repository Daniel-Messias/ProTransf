import { db } from "./firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ehJogador } from "../utils/jogador";

export const buscarUsuarios = async () => {
  const snapshot = await getDocs(collection(db, "usuarios"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const buscarJogadores = async () => {
  const usuarios = await buscarUsuarios();
  return usuarios.filter(ehJogador);
};

export const buscarClubes = async () => {
  const snapshot = await getDocs(collection(db, "clubes"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const buscarUsuario = async (uid) => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const buscarClube = async (clubeId) => {
  if (!clubeId) return null;
  const snap = await getDoc(doc(db, "clubes", clubeId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
