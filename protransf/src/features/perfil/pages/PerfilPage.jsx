import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../../../services/firebase';
import {
  doc,
  query,
  where,
  collection,
  getDocs,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

import SidebarPerfil from '../components/SidebarPerfil';
import MainPerfil from '../components/MainPerfil';
import styles from '../styles/Perfil.module.css';

export default function PerfilPage() {
  const { id } = useParams();

  const [perfil, setPerfil] = useState(null);
  const [clube, setClube] = useState(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [loadingClube, setLoadingClube] = useState(false);
  const [erro, setErro] = useState(null);

  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [modoLeitura, setModoLeitura] = useState(false);

  const unsubscribeClubeRef = useRef(null);

  async function resolverUid(id) {
    try {
      const userDocSnap = await getDoc(doc(db, 'usuarios', id));
      if (userDocSnap.exists()) return id;

      const usernameQuery = query(collection(db, 'usuarios'), where('username', '==', id));
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) return querySnapshot.docs[0].id;

      return null;
    } catch (err) {
      console.error('Erro ao resolver UID:', err);
      return null;
    }
  }

  async function buscarClubeDono(jogadorId) {
    try {
      const clubesRef = collection(db, 'clubes');
      const q = query(clubesRef, where('criadoPorUsuarioId', '==', jogadorId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const clubeDoc = snapshot.docs[0];
        return { id: clubeDoc.id, ...clubeDoc.data() };
      }
    } catch (error) {
      console.error('Erro ao buscar clube do dono:', error);
    }
    return null;
  }

  useEffect(() => {
    let unsubscribeJogador = () => {};
    unsubscribeClubeRef.current = null;

    async function iniciar() {
      setErro(null);
      setLoadingPerfil(true);
      setLoadingClube(false);

      const authUser = auth.currentUser;
let uidParaBuscar = authUser?.uid;

// Buscar dados completos do usuário logado
let usuarioLogadoFirestore = null;
if (authUser?.uid) {
  const usuarioDocSnap = await getDoc(doc(db, 'usuarios', authUser.uid));
  if (usuarioDocSnap.exists()) {
    usuarioLogadoFirestore = {
      uid: authUser.uid,
      ...usuarioDocSnap.data(),
    };
  }
}
setUsuarioLogado(usuarioLogadoFirestore);


      if (id) {
        if (!authUser || id !== authUser.uid) {
          setModoLeitura(true);
        }

        const uidResolvido = await resolverUid(id);
        if (!uidResolvido) {
          setErro('Perfil não encontrado.');
          setLoadingPerfil(false);
          return;
        }
        uidParaBuscar = uidResolvido;
      }

      const jogadorRef = doc(db, 'usuarios', uidParaBuscar);

      unsubscribeJogador = onSnapshot(
        jogadorRef,
        async (docSnap) => {
          if (!docSnap.exists()) {
            setPerfil(null);
            setClube(null);
            setLoadingPerfil(false);
            return;
          }

          const data = docSnap.data();
          setPerfil({ id: docSnap.id, ...data });

          const jogadorId = docSnap.id;

          // Sempre remove o listener anterior do clube
          if (unsubscribeClubeRef.current) {
            unsubscribeClubeRef.current();
            unsubscribeClubeRef.current = null;
          }

          if (data.clubeAtualId) {
            setLoadingClube(true);
            const clubeRef = doc(db, 'clubes', data.clubeAtualId);
            unsubscribeClubeRef.current = onSnapshot(
              clubeRef,
              (clubeSnap) => {
                if (clubeSnap.exists()) {
                  setClube({ id: clubeSnap.id, ...clubeSnap.data() });
                } else {
                  setClube(null);
                }
                setLoadingClube(false);
              },
              (error) => {
                console.error('Erro onSnapshot clubeAtual:', error);
                setClube(null);
                setLoadingClube(false);
              }
            );
          } else {
            // Se não tem clubeAtualId, tenta buscar se é dono
            setLoadingClube(true);
            const clubeComoDono = await buscarClubeDono(jogadorId);
            if (clubeComoDono) {
              setClube(clubeComoDono);
            } else {
              setClube(null);
            }
            setLoadingClube(false);
          }

          setLoadingPerfil(false);
        },
        (error) => {
          console.error('Erro onSnapshot jogador:', error);
          setErro('Erro ao carregar perfil.');
          setLoadingPerfil(false);
        }
      );
    }

    iniciar();

    return () => {
      unsubscribeJogador();
      if (unsubscribeClubeRef.current) {
        unsubscribeClubeRef.current();
      }
    };
  }, [id]);

  if (loadingPerfil) return <p>Carregando perfil...</p>;
  if (erro) return <p>{erro}</p>;
  if (!perfil) return <p>Perfil não encontrado.</p>;

  return (
    <div className={styles.layout}>
      <SidebarPerfil jogador={perfil} />
      <MainPerfil
        jogador={perfil}
        clube={clube}
        modoLeitura={modoLeitura}
        usuarioLogado={usuarioLogado}
        loadingClube={loadingClube}
      />
    </div>
  );
}
