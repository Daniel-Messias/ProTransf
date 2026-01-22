import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../../services/firebase";

export default function UltimasTransferencias() {
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function buscarConvites() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "convites"),
          orderBy("criadoEm", "desc"),
          limit(5)
        );

        const snapshot = await getDocs(q);

        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setConvites(lista);
      } catch (error) {
        console.error("Erro ao buscar convites:", error);
      }
      setLoading(false);
    }

    buscarConvites();
  }, []);

  if (loading) {
    return <p className="transferencias-loading">Carregando últimas transferências...</p>;
  }

  if (convites.length === 0) {
    return <p className="transferencias-empty">Nenhuma transferência encontrada.</p>;
  }

  return (
    <div className="transferencias-feed">
      {convites.map(c => (
        <div
          key={c.id}
          className={`transferencia-item status-${c.status}`}
        >
          {/* Linha principal */}
          <div className="transferencia-main">
            <span
              className="transferencia-time clickable"
              onClick={() => navigate(`/perfil/${c.jogadorUsername}`)}
              title={`Perfil do jogador ${c.jogadorUsername}`}
            >
              {c.jogadorUsername}
            </span>

            <span className="transferencia-arrow">➜</span>

            <span
              className="transferencia-time destaque clickable"
              onClick={() => navigate(`/perfil/${c.clubeId}`)}
              title={`Perfil do clube ${c.clubeNome}`}
            >
              {c.clubeNome}
            </span>
          </div>

          {/* Linha secundária (status / meta) */}
          <div className="transferencia-meta">
            <span className={`status-badge ${c.status}`}>
              {c.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
