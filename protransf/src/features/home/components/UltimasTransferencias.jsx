import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../../services/firebase";

const ROTULO_STATUS = { aceito: "Fechado", recusado: "Melou", pendente: "Negociando" };

export default function UltimasTransferencias() {
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarConvites() {
      try {
        const q = query(collection(db, "convites"), orderBy("criadoEm", "desc"), limit(5));
        const snapshot = await getDocs(q);
        setConvites(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
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
      {convites.map((c) => {
        const nomeJogador = c.jogadorUsername || c.jogadorNome || "Jogador";
        return (
          <div key={c.id} className={`transferencia-item status-${c.status}`}>
            <div className="transferencia-main">
              <Link
                to={`/jogador/${c.jogadorId}`}
                className="transferencia-time clickable"
                title={`Perfil do jogador ${nomeJogador}`}
              >
                {nomeJogador}
              </Link>

              <span className="transferencia-arrow">➜</span>

              <Link
                to={`/clube/${c.clubeId}`}
                className="transferencia-time destaque clickable"
                title={`Perfil do clube ${c.clubeNome}`}
              >
                {c.clubeNome || "Clube"}
              </Link>
            </div>

            <div className="transferencia-meta">
              <span className={`status-badge ${c.status}`}>
                {ROTULO_STATUS[c.status] || c.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
