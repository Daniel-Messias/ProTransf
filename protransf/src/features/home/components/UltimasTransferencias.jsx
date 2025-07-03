// src/features/home/components/UltimasTransferencias.jsx (exemplo de caminho)
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
          limit(30)
        );
        const snapshot = await getDocs(q);
        const todosConvites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const aceito = todosConvites.find(c => c.status === "aceito");
        const recusado = todosConvites.find(c => c.status === "recusado");
        const pendente = todosConvites.find(c => c.status === "pendente");

        const resultado = [aceito, recusado, pendente].filter(Boolean);
        setConvites(resultado);
      } catch (error) {
        console.error("Erro ao buscar convites:", error);
      }
      setLoading(false);
    }
    buscarConvites();
  }, []);

  if (loading) return <p>Carregando últimas transferências...</p>;
  if (convites.length === 0) return <p>Nenhuma transferência encontrada.</p>;

  const corSeta = (status) => {
    switch (status) {
      case "aceito":
        return "green";
      case "recusado":
        return "red";
      case "pendente":
        return "orange";
      default:
        return "gray";
    }
  };

  return (
    <ul className="transfer-list">
      {convites.map(c => (
        <li key={c.id} className="transfer-item" style={{ marginBottom: "12px" }}>
          <span
            className="from"
            onClick={() => navigate(`/perfil/${c.jogadorUsername}`)}
            style={{ cursor: "pointer" }}
            title={`Perfil do jogador ${c.jogadorUsername}`}
          >
            {c.jogadorUsername}
          </span>

          <span
            className="arrow"
            style={{ color: corSeta(c.status), margin: "0 8px", fontWeight: "bold", fontSize: "18px" }}
            title={`Status: ${c.status}`}
          >
            →
          </span>

          <span
            className="to"
            onClick={() => navigate(`/perfil/${c.clubeId}`)}
            style={{ cursor: "pointer" }}
            title={`Perfil do clube ${c.clubeNome}`}
          >
            {c.clubeNome}
          </span>
        </li>
      ))}
    </ul>
  );
}
