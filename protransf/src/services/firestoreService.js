import { db } from "./firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

// Função que você já tem
export const buscarJogadores = async () => {
  const jogadoresRef = collection(db, "usuarios");
  const snapshot = await getDocs(jogadoresRef);

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(user => user.tipo === "jogador" || user.tipo === "clube_jogador");
};

// --- Novas funções para amistosos ---

// 1. Criar convite de amistoso
export const criarConviteAmistoso = async (clubeAId, clubeBId, dataPartida, observacoes = "") => {
  try {
    const docRef = await addDoc(collection(db, "amistosos"), {
      clubeAId,
      clubeBId,
      status: "pendente",
      dataCriacao: serverTimestamp(),
      dataPartida,
      observacoes,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar convite de amistoso:", error);
    throw error;
  }
};

// 2. Ouvir amistosos pendentes para o clube (em tempo real)
export const ouvirAmistososPendentes = (clubeId, callback) => {
  const q = query(
    collection(db, "amistosos"),
    where("clubeBId", "==", clubeId),
    where("status", "==", "pendente")
  );

  return onSnapshot(q, (querySnapshot) => {
    const amistosos = [];
    querySnapshot.forEach((doc) => {
      amistosos.push({ id: doc.id, ...doc.data() });
    });
    callback(amistosos);
  });
};

// 3. Aceitar ou recusar convite
export const responderConviteAmistoso = async (amistosoId, aceito) => {
  try {
    const docRef = doc(db, "amistosos", amistosoId);
    await updateDoc(docRef, {
      status: aceito ? "aceito" : "recusado",
    });
  } catch (error) {
    console.error("Erro ao responder convite de amistoso:", error);
    throw error;
  }
};
