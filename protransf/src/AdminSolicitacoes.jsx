// src/AdminSolicitacoes.jsx
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./services/firebase";

function AdminSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const col = collection(db, "solicitacoesEstatisticas");
    const q = query(col, where("status", "==", "pendente"));

    const unsub = onSnapshot(q, (snap) => {
      const itens = [];
      snap.forEach((d) => itens.push({ id: d.id, ...d.data() }));
      setSolicitacoes(itens);
      setCarregando(false);
    });

    return () => unsub();
  }, []);

  const toNumber = (v) => Number(v || 0);

  async function aprovarSolicitacao(s) {
    try {
      // 1) Buscar jogador
    const jogadorRef = doc(db, "usuarios", s.jogadorId);
      const snapJogador = await getDoc(jogadorRef);

      if (!snapJogador.exists()) {
        alert("Jogador não encontrado para esta solicitação.");
        return;
      }

      const j = snapJogador.data();

      // 2) Calcular novos totais
            const novosDados = {
        totalGols: toNumber(j.totalGols) + toNumber(s.gols),
        totalAssistencias:
          toNumber(j.totalAssistencias) + toNumber(s.assistencias),
        totalDesarmes: toNumber(j.totalDesarmes) + toNumber(s.desarmes),
        totalDefesas: toNumber(j.totalDefesas) + toNumber(s.defesas),
        totalCartoesAmarelos:
          toNumber(j.totalCartoesAmarelos) + toNumber(s.amarelos),
        totalCartoesVermelhos:
          toNumber(j.totalCartoesVermelhos) + toNumber(s.vermelhos),
      };


      // 3) Atualizar jogador
      await updateDoc(jogadorRef, novosDados);

      // 4) Atualizar solicitação
      const solicRef = doc(db, "solicitacoesEstatisticas", s.id);
      await updateDoc(solicRef, {
        status: "aprovada",
        aprovadaEm: new Date(),
      });

      alert("Solicitação aprovada e estatísticas somadas.");
    } catch (err) {
      console.error("Erro ao aprovar solicitação:", err);
      alert("Erro ao aprovar solicitação.");
    }
  }

  async function rejeitarSolicitacao(id) {
    try {
      const ref = doc(db, "solicitacoesEstatisticas", id);
      await updateDoc(ref, {
        status: "rejeitada",
        rejeitadaEm: new Date(),
      });
      alert("Solicitação rejeitada.");
    } catch (err) {
      console.error("Erro ao rejeitar solicitação:", err);
      alert("Erro ao rejeitar solicitação.");
    }
  }

  if (carregando) return <div style={{ padding: "1.5rem" }}>Carregando solicitações...</div>;

  return (
    <div style={{ padding: "1.5rem", color: "#fff", background: "#020510", minHeight: "100vh" }}>
      <h1>Solicitações de estatísticas</h1>

      {solicitacoes.length === 0 && <p>Não há solicitações pendentes.</p>}

      {solicitacoes.map((s) => (
        <div
          key={s.id}
          style={{
            border: "1px solid #00bfff",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            background: "#050a14",
          }}
        >
          <p><strong>Jogador:</strong> {s.jogadorId}</p>
          <p><strong>Data da partida:</strong> {s.dataPartida || "—"}</p>
          <p>
            <strong>Gols:</strong> {s.gols} |{" "}
            <strong>Assistências:</strong> {s.assistencias}
          </p>
          <p>
            <strong>Desarmes:</strong> {s.desarmes} |{" "}
            <strong>Defesas:</strong> {s.defesas}
          </p>
          <p>
            <strong>Amarelos:</strong> {s.amarelos} |{" "}
            <strong>Vermelhos:</strong> {s.vermelhos}
          </p>
          {s.observacoes && <p><strong>Obs:</strong> {s.observacoes}</p>}
          {s.fotoUrl && (
            <p>
              <a href={s.fotoUrl} target="_blank" rel="noreferrer">
                Ver foto das estatísticas
              </a>
            </p>
          )}

          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => aprovarSolicitacao(s)}
              style={{
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
                background: "#00b894",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
              }}
            >
              Aprovar e somar no jogador
            </button>
            <button
              onClick={() => rejeitarSolicitacao(s.id)}
              style={{
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
                background: "#d63031",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
              }}
            >
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminSolicitacoes;
