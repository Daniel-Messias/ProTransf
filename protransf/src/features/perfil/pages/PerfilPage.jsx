import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../../../services/firebase';
import {
  doc,
  query,
  where,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';

import SidebarPerfil from '../components/SidebarPerfil';
import MainPerfil from '../components/MainPerfil';
import styles from '../styles/Perfil.module.css';

export default function PerfilPage() {
  const { id } = useParams(); // Pode ser username ou UID
  const [perfil, setPerfil] = useState(null);
  const [clube, setClube] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [modoLeitura, setModoLeitura] = useState(false);

  useEffect(() => {
    let unsubscribeJogador = () => {};
    let unsubscribeClube = () => {};

    async function iniciar() {
      setLoading(true);

      const authUser = auth.currentUser;
      setUsuarioLogado(authUser);

      let uidParaBuscar = authUser?.uid;

      // Se estiver acessando outro perfil via /perfil/:id (pode ser username ou UID)
      if (id) {
        if (!authUser || id !== authUser.uid) {
          setModoLeitura(true);
        }

        // Tentar usar id direto como UID
        const userDocRef = doc(db, 'usuarios', id);
        const userDocSnap = await getDocs(query(collection(db, 'usuarios'), where('username', '==', id)));

        // Verifica se existe documento com UID == id
        try {
          const docSnap = await new Promise((resolve, reject) => {
            onSnapshot(userDocRef, (doc) => resolve(doc), (error) => reject(error));
          });
          if (docSnap.exists()) {
            uidParaBuscar = id;
          } else if (!userDocSnap.empty) {
            // Se não achou UID, tenta por username
            uidParaBuscar = userDocSnap.docs[0].id;
          } else {
            setPerfil(null);
            setLoading(false);
            return;
          }
        } catch {
          // fallback se erro
          setPerfil(null);
          setLoading(false);
          return;
        }
      }

      // Ouvir dados do jogador em tempo real
      const jogadorRef = doc(db, 'usuarios', uidParaBuscar);
      unsubscribeJogador = onSnapshot(jogadorRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPerfil({ id: docSnap.id, ...data });

          // Ouvir clube em tempo real se houver clubeAtualId
          if (data.clubeAtualId) {
            const clubeRef = doc(db, 'clubes', data.clubeAtualId);
            if (unsubscribeClube) unsubscribeClube();
            unsubscribeClube = onSnapshot(clubeRef, (clubeSnap) => {
              if (clubeSnap.exists()) {
                setClube({ id: clubeSnap.id, ...clubeSnap.data() });
              } else {
                setClube(null);
              }
            });
          } else {
            setClube(null);
            if (unsubscribeClube) unsubscribeClube();
          }

          // Controla modo leitura
          if (authUser && uidParaBuscar === authUser.uid) {
            setModoLeitura(false);
          } else {
            setModoLeitura(true);
          }
        } else {
          setPerfil(null);
          setClube(null);
        }
        setLoading(false);
      }, (error) => {
        console.error('Erro onSnapshot jogador:', error);
        setLoading(false);
      });
    }

    iniciar();

    return () => {
      unsubscribeJogador();
      unsubscribeClube();
    };
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!perfil) return <p>Perfil não encontrado.</p>;

  return (
    <div className={styles.layout}>
      <SidebarPerfil jogador={perfil} />
      <MainPerfil
        jogador={perfil}
        clube={clube}
        modoLeitura={modoLeitura}
        usuarioLogado={usuarioLogado}
      />
    </div>
  );
}
