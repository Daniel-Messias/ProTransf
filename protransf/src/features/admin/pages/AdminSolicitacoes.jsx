import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  increment,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../services/firebase";
import { buscarUsuario } from "../../../services/firestoreService";
import Loader from "../../../components/Loader";
import styles from "../admin.module.css";

function AdminSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [jogadores, setJogadores] = useState({}); // jogadorId -> perfil
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
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

  // busca nome/username de quem enviou cada solicitação
  useEffect(() => {
    const faltando = [...new Set(solicitacoes.map((s) => s.jogadorId))].filter(
      (id) => id && !(id in jogadores)
    );
    if (faltando.length === 0) return;

    Promise.all(faltando.map(buscarUsuario)).then((perfis) => {
      setJogadores((prev) => {
        const novo = { ...prev };
        faltando.forEach((id, i) => (novo[id] = perfis[i]));
        return novo;
      });
    });
  }, [solicitacoes, jogadores]);

  useEffect(() => {
    if (!mensagem) return;
    const timer = setTimeout(() => setMensagem(null), 4000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  const toNumber = (v) => Number(v || 0);

  async function aprovarSolicitacao(s) {
    if (jogadores[s.jogadorId] === null) {
      setMensagem({ tipo: "erro", texto: "Jogador não encontrado para esta solicitação." });
      return;
    }

    setProcessando(s.id);
    try {
      // increment() + batch: soma atômica no servidor, sem risco de duas
      // aprovações seguidas sobrescreverem uma à outra.
      const batch = writeBatch(db);

      batch.update(doc(db, "usuarios", s.jogadorId), {
        totalGols: increment(toNumber(s.gols)),
        totalAssistencias: increment(toNumber(s.assistencias)),
        totalDesarmes: increment(toNumber(s.desarmes)),
        totalDefesas: increment(toNumber(s.defesas)),
        totalCartoesAmarelos: increment(toNumber(s.amarelos)),
        totalCartoesVermelhos: increment(toNumber(s.vermelhos)),
        totalPartidas: increment(1),
      });

      batch.update(doc(db, "solicitacoesEstatisticas", s.id), {
        status: "aprovada",
        aprovadaEm: serverTimestamp(),
      });

      await batch.commit();
      setMensagem({ tipo: "sucesso", texto: "Solicitação aprovada e estatísticas somadas." });
    } catch (err) {
      console.error("Erro ao aprovar solicitação:", err);
      setMensagem({ tipo: "erro", texto: "Erro ao aprovar solicitação." });
    } finally {
      setProcessando(null);
    }
  }

  async function rejeitarSolicitacao(id) {
    setProcessando(id);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "solicitacoesEstatisticas", id), {
        status: "rejeitada",
        rejeitadaEm: serverTimestamp(),
      });
      await batch.commit();
      setMensagem({ tipo: "sucesso", texto: "Solicitação rejeitada." });
    } catch (err) {
      console.error("Erro ao rejeitar solicitação:", err);
      setMensagem({ tipo: "erro", texto: "Erro ao rejeitar solicitação." });
    } finally {
      setProcessando(null);
    }
  }

  if (carregando) return <Loader texto="Carregando solicitações..." />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Solicitações de estatísticas</h1>

      {mensagem && (
        <div className={`${styles.banner} ${styles[mensagem.tipo]}`}>{mensagem.texto}</div>
      )}

      {solicitacoes.length === 0 && <p className={styles.empty}>Não há solicitações pendentes.</p>}

      {solicitacoes.map((s) => (
        <div key={s.id} className={styles.card}>
          <p>
            <strong>Jogador:</strong>{" "}
            <Link to={`/jogador/${s.jogadorId}`} className={styles.linkJogador}>
              {jogadores[s.jogadorId]
                ? `${jogadores[s.jogadorId].nome || "Sem nome"} (@${jogadores[s.jogadorId].username || "—"})`
                : jogadores[s.jogadorId] === null
                ? "⚠ jogador não encontrado"
                : s.jogadorId}
            </Link>
          </p>
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
            // fotos novas são data URL (o navegador bloqueia abrir em nova aba),
            // então o print aparece aqui mesmo; clique para ampliar
            <img
              src={s.fotoUrl}
              alt="Print das estatísticas da partida"
              className={`${styles.fotoStats} ${fotoAmpliada === s.id ? styles.fotoAmpliada : ""}`}
              onClick={() => setFotoAmpliada(fotoAmpliada === s.id ? null : s.id)}
              title="Clique para ampliar"
            />
          )}

          <div className={styles.actions}>
            <button
              className={styles.btnAprovar}
              onClick={() => aprovarSolicitacao(s)}
              disabled={processando === s.id}
            >
              Aprovar e somar no jogador
            </button>
            <button
              className={styles.btnRejeitar}
              onClick={() => rejeitarSolicitacao(s.id)}
              disabled={processando === s.id}
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
