import React, { useState } from "react";
import { criarConviteAmistoso } from "../../../services/firestoreService";
import { auth } from "../../../services/firebase";

export default function AmistosoForm({ clubeBId, clubeBNome, onSucesso }) {
  const [dataHora, setDataHora] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Pegar clubeAId do usuário logado (supondo que o uid seja o ID do clube_jogador)
  const clubeAId = auth.currentUser ? auth.currentUser.uid : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    if (!dataHora) {
      setErro("Por favor, selecione data e hora da partida.");
      return;
    }

    if (!clubeAId) {
      setErro("Usuário não autenticado.");
      return;
    }

    setLoading(true);
    try {
      await criarConviteAmistoso(clubeAId, clubeBId, new Date(dataHora), observacoes);
      setDataHora("");
      setObservacoes("");
      if (onSucesso) onSucesso();
      alert(`Convite enviado para ${clubeBNome} com sucesso!`);
    } catch (err) {
      setErro("Erro ao enviar convite. Tente novamente.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h3>Convidar {clubeBNome} para amistoso</h3>

      <label>
        Data e Hora da Partida:
        <input
          type="datetime-local"
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          required
          disabled={loading}
          style={{ display: "block", marginTop: 5, marginBottom: 15, width: "100%" }}
        />
      </label>

      <label>
        Observações (opcional):
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          disabled={loading}
          rows={3}
          style={{ display: "block", marginTop: 5, marginBottom: 15, width: "100%" }}
        />
      </label>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Enviando..." : "Enviar Convite"}
      </button>
    </form>
  );
}
