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
import { db } from "../../../services/firebase";
import styles from "../admin.module.css";

function AdminSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

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

  useEffect(() => {
    if (!mensagem) return;
    const timer = setTimeout(() => setMensagem(null), 4000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  const toNumber = (v) => Number(v || 0);

  async function aprovarSolicitacao(s) {
    try {
      const jogadorRef = doc(db, "usuarios", s.jogadorId);
      const snapJogador = await getDoc(jogadorRef);

      if (!snapJogador.exists()) {
        setMensagem({ tipo: "erro", texto: "Jogador não encontrado para esta solicitação." });
        return;
      }

      const j = snapJogador.data();

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

      await updateDoc(jogadorRef, novosDados);

      const solicRef = doc(db, "solicitacoesEstatisticas", s.id);
      await updateDoc(solicRef, {
        status: "aprovada",
        aprovadaEm: new Date(),
      });

      setMensagem({ tipo: "sucesso", texto: "Solicitação aprovada e estatísticas somadas." });
    } catch (err) {
      console.error("Erro ao aprovar solicitação:", err);
      setMensagem({ tipo: "erro", texto: "Erro ao aprovar solicitação." });
    }
  }

  async function rejeitarSolicitacao(id) {
    try {
      const ref = doc(db, "solicitacoesEstatisticas", id);
      await updateDoc(ref, {
        status: "rejeitada",
        rejeitadaEm: new Date(),
      });
      setMensagem({ tipo: "sucesso", texto: "Solicitação rejeitada." });
    } catch (err) {
      console.error("Erro ao rejeitar solicitação:", err);
      setMensagem({ tipo: "erro", texto: "Erro ao rejeitar solicitação." });
    }
  }

  if (carregando) return <div className={styles.page}>Carregando solicitações...</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Solicitações de estatísticas</h1>

      {mensagem && (
        <div className={`${styles.banner} ${styles[mensagem.tipo]}`}>{mensagem.texto}</div>
      )}

      {solicitacoes.length === 0 && <p className={styles.empty}>Não há solicitações pendentes.</p>}

      {solicitacoes.map((s) => (
        <div key={s.id} className={styles.card}>
          <p><strong>Jogador:</strong> {s.jogadorId}</p>
          <p><strong>Data da partida:</strong> {s.dataPartida || "—"}</p>
          <p>
            <strong>Gols:</strong> {s.gols} {" "}
            <strong>Assistências:</strong> {s.assistencias}
          </p>
          <p>
            <strong>Desarmes:</strong> {s.desarmes} {" "}
            <strong>Defesas:</strong> {s.defesas}
          </p>
          <p>
            <strong>Amarelos:</strong> {s.amarelos} {" "}
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

          <div className={styles.actions}>
            <button className={styles.btnAprovar} onClick={() => aprovarSolicitacao(s)}>
              Aprovar e somar no jogador
            </button>
            <button className={styles.btnRejeitar} onClick={() => rejeitarSolicitacao(s.id)}>
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminSolicitacoes;
