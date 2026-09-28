import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export const buscarJogadores = async () => {
  const jogadoresRef = collection(db, "usuarios");
  const snapshot = await getDocs(jogadoresRef);

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(user => user.tipo === "jogador" || user.tipo === "clube_jogador");
};
