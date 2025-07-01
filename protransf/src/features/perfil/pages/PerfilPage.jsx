// src/features/perfil/pages/PerfilPage.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

import SidebarPerfil from '../components/SidebarPerfil';
import MainPerfil from '../components/MainPerfil';
import AmistosoForm from "../components/AmistosoForm";


import styles from '../styles/Perfil.module.css';

export default function PerfilPage() {
  const [jogador, setJogador] = useState(null);
  const [clube, setClube] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setJogador(null);
        setClube(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'usuarios', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setJogador(data);

          if (data.tipo === 'clube_jogador' && data.clubeAtualId) {
            const clubeRef = doc(db, 'clubes', data.clubeAtualId);
            const clubeSnap = await getDoc(clubeRef);
            if (clubeSnap.exists()) {
              setClube(clubeSnap.data());
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (!jogador) return <p>Usuário não encontrado ou não logado.</p>;

  return (
    <div className={styles.layout}>
      <SidebarPerfil jogador={jogador} />
      <MainPerfil jogador={jogador} clube={clube} />
    </div>
  );
}
