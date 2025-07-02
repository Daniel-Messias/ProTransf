import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

import SidebarPerfil from '../components/SidebarPerfil';
import MainPerfil from '../components/MainPerfil';
import styles from '../styles/Perfil.module.css';

export default function PerfilPage() {
  const { id } = useParams(); // Pode ser undefined se for próprio perfil
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
          setPerfil(null);
          setModoLeitura(true); // visitante anônimo
          setLoading(false);
          return;
        }

        setUsuarioLogado(authUser);

        const uidParaBuscar = id || authUser.uid; // se não houver id, usa uid logado

        const userRef = doc(db, 'usuarios', uidParaBuscar);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setPerfil(data);

          if (data.tipo === 'clube_jogador' && data.clubeAtualId) {
            const clubeRef = doc(db, 'clubes', data.clubeAtualId);
            const clubeSnap = await getDoc(clubeRef);
            if (clubeSnap.exists()) {
              setClube(clubeSnap.data());
            }
          }

          if (id && id !== authUser.uid) {
            setModoLeitura(true); // está acessando perfil de outro usuário
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
      <MainPerfil jogador={perfil} clube={clube} modoLeitura={modoLeitura} usuarioLogado={usuarioLogado} />
    </div>
  );
}
