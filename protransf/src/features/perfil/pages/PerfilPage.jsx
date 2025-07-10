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
  const { id } = useParams(); // Pode ser username ou UID

  const [perfil, setPerfil] = useState(null);
  const [clube, setClube] = useState(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [loadingClube, setLoadingClube] = useState(false);
  const [erro, setErro] = useState(null);

  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [modoLeitura, setModoLeitura] = useState(false);

  const unsubscribeClubeRef = useRef(null);

  // Função para resolver o id para uid real
  async function resolverUid(id) {
    try {
      // Tenta buscar doc por UID direto
      const userDocSnap = await getDoc(doc(db, 'usuarios', id));
      if (userDocSnap.exists()) {
        return id;
      }

      // Se não existir, tenta buscar pelo username
      const usernameQuery = query(collection(db, 'usuarios'), where('username', '==', id));
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }

      // Não achou nenhum
      return null;
    } catch (err) {
      console.error('Erro ao resolver UID:', err);
      return null;
    }
  }

  useEffect(() => {
    let unsubscribeJogador = () => {};
    unsubscribeClubeRef.current = null;

    async function iniciar() {
      setErro(null);
      setLoadingPerfil(true);
      setLoadingClube(false);

      const authUser = auth.currentUser;
      setUsuarioLogado(authUser);

      let uidParaBuscar = authUser?.uid;

      if (id) {
        // Se estiver acessando outro perfil, ativa modo leitura
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

      // Listener em tempo real do jogador
      const jogadorRef = doc(db, 'usuarios', uidParaBuscar);
      unsubscribeJogador = onSnapshot(
        jogadorRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPerfil({ id: docSnap.id, ...data });

            // Atualiza modo leitura se for o próprio usuário
            if (authUser && uidParaBuscar === authUser.uid) {
              setModoLeitura(false);
            } else {
              setModoLeitura(true);
            }

            // Gerencia listener do clube
            if (data.clubeAtualId) {
              if (unsubscribeClubeRef.current) {
                unsubscribeClubeRef.current();
                unsubscribeClubeRef.current = null;
              }
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
                  console.error('Erro onSnapshot clube:', error);
                  setErro('Erro ao carregar dados do clube.');
                  setLoadingClube(false);
                }
              );
            } else {
              if (unsubscribeClubeRef.current) {
                unsubscribeClubeRef.current();
                unsubscribeClubeRef.current = null;
              }
              setClube(null);
              setLoadingClube(false);
            }
          } else {
            setPerfil(null);
            setClube(null);
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
console.log('PerfilPage - clube:', clube);

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
