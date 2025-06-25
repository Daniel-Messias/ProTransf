import React, { useEffect, useState } from 'react';
import { auth, db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

import BlocoJogador from '../components/BlocoJogador';
import BlocoClube from '../components/BlocoClube';
import styles from '../styles/Perfil.module.css';


export default function PerfilPage() {
  const [jogador, setJogador] = useState(null);
  const [loadingJogador, setLoadingJogador] = useState(true);
  const [clube, setClube] = useState(null);
  const [loadingClube, setLoadingClube] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Usuário atual:', user);
      if (!user) {
        setJogador(null);
        setLoadingJogador(false);
        setLoadingClube(false);
        return;
      }

      try {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const jogadorData = docSnap.data();
          setJogador(jogadorData);
          setLoadingJogador(false);

          if (jogadorData.tipo === 'clube_jogador' && jogadorData.clubeAtualId) {
            setLoadingClube(true);
            const clubeRef = doc(db, 'clubes', jogadorData.clubeAtualId);
            const clubeSnap = await getDoc(clubeRef);
            if (clubeSnap.exists()) {
              setClube(clubeSnap.data());
            } else {
              setClube(null);
            }
            setLoadingClube(false);
          } else {
            setClube(null);
            setLoadingClube(false);
          }
        } else {
          setJogador(null);
          setLoadingJogador(false);
          setClube(null);
          setLoadingClube(false);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setJogador(null);
        setLoadingJogador(false);
        setClube(null);
        setLoadingClube(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loadingJogador) return <p>Carregando dados do jogador...</p>;
  if (!jogador) return <p>Jogador não encontrado ou não logado.</p>;

  return (
    <section className={styles.container}>
       <h1 className={styles.title}>Perfil Unificado</h1>
      <BlocoJogador jogador={jogador} />
      <BlocoClube jogador={jogador} clube={clube} loading={loadingClube} />
    </section>
  );
}
