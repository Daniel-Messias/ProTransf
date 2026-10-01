import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { getClubeId, getPresidenteId } from "../utils/jogador";

// Mesmo UID usado em firestore.rules -> isAdmin()
export const ADMIN_UIDS = ["Am6psnQw80fyw5GLfKqj8tnjyBz2"];

const AuthContext = createContext({
  user: null,
  perfil: null,
  clube: null,
  ehPresidente: false,
  ehAdmin: false,
  carregando: true,
});

/**
 * Mantém em um só lugar: usuário logado, o documento dele em `usuarios`
 * (ao vivo) e o clube a que ele pertence. Evita que cada tela/card faça a
 * mesma leitura no Firestore.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  // undefined = ainda carregando · null = sem clube (ou clube apagado)
  const [clube, setClube] = useState(undefined);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      if (!u) {
        setPerfil(null);
        setCarregando(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      doc(db, "usuarios", user.uid),
      (snap) => {
        setPerfil(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setCarregando(false);
      },
      (err) => {
        console.error("Erro ao carregar perfil:", err);
        setCarregando(false);
      }
    );
  }, [user]);

  const clubeId = getClubeId(perfil);

  useEffect(() => {
    if (!clubeId) {
      setClube(null);
      return;
    }
    setClube(undefined);
    return onSnapshot(
      doc(db, "clubes", clubeId),
      (snap) => setClube(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (err) => {
        console.error("Erro ao carregar clube:", err);
        setClube(null);
      }
    );
  }, [clubeId]);

  const valor = {
    user,
    perfil,
    clube,
    ehPresidente: !!user && !!clube && getPresidenteId(clube) === user.uid,
    ehAdmin: !!user && ADMIN_UIDS.includes(user.uid),
    carregando,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
