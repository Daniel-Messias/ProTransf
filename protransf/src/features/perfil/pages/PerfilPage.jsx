import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../../../services/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import SidebarPerfil from '../components/SidebarPerfil';
import MainPerfil from '../components/MainPerfil';
import styles from '../styles/Perfil.module.css';

export default function PerfilPage() {
  const { id } = useParams(); // Pode ser username
  const [perfil, setPerfil] = useState(null);
  const [clube, setClube] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [modoLeitura, setModoLeitura] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = auth.currentUser;
        if (!authUser) {
          setModoLeitura(true);
        }

        setUsuarioLogado(authUser);
        let uidParaBuscar = authUser?.uid;

        // Se estiver acessando outro perfil via /perfil/:id (possivelmente username)
        if (id) {
          if (!authUser || id !== authUser.uid) {
            setModoLeitura(true); // já ativa modo leitura por segurança
          }

          // Tenta buscar direto por UID
          const userDocDirect = await getDoc(doc(db, 'usuarios', id));
          if (userDocDirect.exists()) {
            uidParaBuscar = id;
          } else {
            // Se não existe com esse id, talvez seja username → buscar com query
            const q = query(collection(db, 'usuarios'), where('username', '==', id));
            const snap = await getDocs(q);
            if (!snap.empty) {
              uidParaBuscar = snap.docs[0].id;
            } else {
              setPerfil(null);
              setLoading(false);
              return;
            }
          }
        }

        // Buscar dados do usuário (com UID correto)
        const userRef = doc(db, 'usuarios', uidParaBuscar);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setPerfil(data);

          // Se for clube_jogador e tiver clube vinculado
          if (data.tipo === 'clube_jogador' && data.clubeAtualId) {
            const clubeRef = doc(db, 'clubes', data.clubeAtualId);
            const clubeSnap = await getDoc(clubeRef);
            if (clubeSnap.exists()) {
              setClube(clubeSnap.data());
            }
          }

          // Confirma se é dono do perfil
          if (authUser && uidParaBuscar === authUser.uid) {
            setModoLeitura(false); // edição permitida
          } else {
            setModoLeitura(true); // visitante
          }

        } else {
          setPerfil(null);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
