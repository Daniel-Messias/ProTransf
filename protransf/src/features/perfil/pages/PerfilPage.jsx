import React from 'react';

export default function PerfilPage() {
  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h1>Perfil Unificado</h1>

      <div style={{ marginBottom: 40 }}>
        <h2>Informações do Jogador</h2>
        <p>Aqui vai o conteúdo do perfil do jogador</p>
      </div>

      <div>
        <h2>Informações do Clube</h2>
        <p>Aqui vai o conteúdo do perfil do clube</p>
      </div>
    </section>
  );
}
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PerfilPage() {
  const [jogador, setJogador] = useState(null);
  const [loadingJogador, setLoadingJogador] = useState(true);

  useEffect(() => {
    async function fetchJogador() {
      const user = auth.currentUser;
      if (!user) {
        setJogador(null);
        setLoadingJogador(false);
        return;
      }

      try {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setJogador(docSnap.data());
        } else {
          setJogador(null);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do jogador:', error);
        setJogador(null);
      } finally {
        setLoadingJogador(false);
      }
    }

    fetchJogador();
  }, []);

  if (loadingJogador) return <p>Carregando dados do jogador...</p>;
  if (!jogador) return <p>Jogador não encontrado ou não logado.</p>;

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h1>Perfil Unificado</h1>

      <div style={{ marginBottom: 40 }}>
        <h2>Informações do Jogador</h2>
        <p><strong>Nome:</strong> {jogador.nome}</p>
        <p><strong>Username:</strong> @{jogador.username}</p>
      </div>

      <div>
        <h2>Informações do Clube</h2>
        <p>Aqui vai o conteúdo do perfil do clube</p>
      </div>
    </section>
  );
}
