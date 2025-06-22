import React, { useEffect, useState } from 'react';
import { auth, db } from '../../../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import './ConvitesPendentes.css';

export default function ConvitesPendentes() {
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setConvites([]);
        setLoading(false);
        return;
      }

      try {
        const emailUsuario = user.email.toLowerCase();

        const convitesRef = collection(db, 'convites');
        const q = query(
          convitesRef,
          where('jogadorEmail', '==', emailUsuario),
          where('status', '==', 'pendente')
        );

        const snapshot = await getDocs(q);
        const convitesPendentes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setConvites(convitesPendentes);
      } catch (error) {
        console.error('Erro ao buscar convites:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function buscarUsernamePorEmail(email) {
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return {
        uid: querySnapshot.docs[0].id,
        username: querySnapshot.docs[0].data().username || null,
      };
    }
    return null;
  }

  const aceitarConvite = async (convite) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const clubeRef = doc(db, 'clubes', convite.clubeId);

      const jogadorInfo = await buscarUsernamePorEmail(convite.jogadorEmail);
      if (!jogadorInfo || !jogadorInfo.username) {
        alert('Não foi possível encontrar o jogador no banco de dados.');
        return;
      }

      await updateDoc(clubeRef, {
        jogadores: arrayUnion({
          username: jogadorInfo.username,
          posicao: convite.posicao,
          status: 'Contratado',
          plataforma: convite.plataforma,
        }),
      });

      await updateDoc(doc(db, 'convites', convite.id), {
        status: 'aceito',
        respondidoEm: serverTimestamp(),
      });

      const clubeDoc = await getDoc(clubeRef);
      if (!clubeDoc.exists()) {
        alert('Clube não encontrado.');
        return;
      }
      const clubeData = clubeDoc.data();
      const nomeDoClube = clubeData.nome;

      await updateDoc(doc(db, 'usuarios', jogadorInfo.uid), {
        status: 'Contratado',
        clubeAtual: nomeDoClube,
        clubeAtualId: convite.clubeId, // ← CAMPO ADICIONADO AQUI
      });

      setConvites(convites.filter(c => c.id !== convite.id));
      alert(`Você entrou no clube "${nomeDoClube}"`);
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      alert('Erro ao aceitar o convite. Tente novamente.');
    }
  };

  const recusarConvite = async (convite) => {
    try {
      const conviteRef = doc(db, 'convites', convite.id);
      await updateDoc(conviteRef, {
        status: 'recusado',
        respondidoEm: serverTimestamp(),
      });

      setConvites(convites.filter(c => c.id !== convite.id));
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      alert('Erro ao recusar o convite. Tente novamente.');
    }
  };

  if (loading) return <p>Carregando convites...</p>;
  if (convites.length === 0) return null;

  return (
    <div className="convites-container">
      <h4>📬 Convites Pendentes</h4>
      <ul className="convites-lista">
        {convites.map((convite) => (
          <li key={convite.id} className="convite-item">
            <div className="convite-info">
              <span className="convite-clube">{convite.clubeNome}</span>
              <span className="convite-posicao">{convite.posicao}</span>
            </div>
            <div className="convite-botoes">
              <button className="btn btn-aceitar" onClick={() => aceitarConvite(convite)}>Aceitar</button>
              <button className="btn btn-recusar" onClick={() => recusarConvite(convite)}>Recusar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
