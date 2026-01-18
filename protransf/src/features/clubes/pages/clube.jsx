import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./Clube.module.css";

// Firebase
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../services/firebase";

export default function Clube() {
  // ===============================
  // PARAMS
  // ===============================
  const { id } = useParams();

  // ===============================
  // ESTADOS PRINCIPAIS
  // ===============================
  const [usuario, setUsuario] = useState(null);
  const [clubeIdUsuario, setClubeIdUsuario] = useState(null);

  const [clube, setClube] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // CONTROLE DE EDIÇÃO
  // ===============================
  const [editando, setEditando] = useState(false);

  // ===============================
  // ESTADOS TEMPORÁRIOS (EDIÇÃO)
  // ===============================
  const [bioTemp, setBioTemp] = useState("");
  const [statusTemp, setStatusTemp] = useState("");
  const [elencoTemp, setElencoTemp] = useState([]);

  // ===============================
  // ESTADOS PARA EXIBIR ELENCO
  // ===============================
  const [elencoDetalhado, setElencoDetalhado] = useState([]);

  // ===============================
  // ADICIONAR JOGADOR
  // ===============================
  const [novoUserId, setNovoUserId] = useState("");
  const [novaCamisa, setNovaCamisa] = useState("");

  // ===============================
  // CRIAR CLUBE
  // ===============================
  const [criando, setCriando] = useState(false);
  const [nomeClube, setNomeClube] = useState("");
  const [usernameClube, setUsernameClube] = useState("");
  const [plataforma, setPlataforma] = useState("PlayStation");

  // ===============================
  // USUÁRIO LOGADO + CLUBEID
  // ===============================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setUsuario(user);

      const refUsuario = doc(db, "usuarios", user.uid);
      const snap = await getDoc(refUsuario);

      if (snap.exists()) {
        const dados = snap.data();
        setClubeIdUsuario(dados.clubeId || null);
      }
    });

    return () => unsub();
  }, []);

  // ===============================
  // BUSCAR CLUBE
  // ===============================
  useEffect(() => {
    async function buscarClube() {
      try {
        const clubeIdFinal = id || clubeIdUsuario;
        if (!clubeIdFinal) {
          setLoading(false);
          return;
        }

        const ref = doc(db, "clubes", clubeIdFinal);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const dados = snap.data();
          setClube({ id: snap.id, ...dados });
          setBioTemp(dados.bio || "");
          setStatusTemp(dados.statusMercado || "");
          setElencoTemp(dados.elenco || []);
        }
      } catch (error) {
        console.error("Erro ao buscar clube:", error);
      } finally {
        setLoading(false);
      }
    }

    buscarClube();
  }, [id, clubeIdUsuario]);

  // ===============================
  // BUSCAR JOGADORES DO ELENCO
  // ===============================
  useEffect(() => {
    async function carregarElenco() {
      if (!elencoTemp || elencoTemp.length === 0) {
        setElencoDetalhado([]);
        return;
      }

      try {
        const jogadores = await Promise.all(
          elencoTemp.map(async (item) => {
            const refJogador = doc(db, "usuarios", item.userId);
            const snap = await getDoc(refJogador);
            if (!snap.exists()) return null;

            return {
              userId: item.userId,
              camisa: item.camisa,
              ...snap.data(),
            };
          })
        );

        setElencoDetalhado(jogadores.filter(Boolean));
      } catch (error) {
        console.error("Erro ao carregar elenco:", error);
      }
    }

    carregarElenco();
  }, [elencoTemp]);

  // ===============================
  // É PRESIDENTE?
  // ===============================
  const isPresidente =
    usuario && clube && usuario.uid === clube.presidenteId;

  // ===============================
  // FUNÇÕES ELENCO
  // ===============================
  function alterarCamisa(index, novoNumero) {
    setElencoTemp((prev) =>
      prev.map((j, i) =>
        i === index ? { ...j, camisa: novoNumero } : j
      )
    );
  }

  function removerJogador(index) {
    setElencoTemp((prev) => prev.filter((_, i) => i !== index));
  }

  function adicionarJogador() {
    if (!novoUserId || !novaCamisa) {
      alert("Informe o UID do jogador e a camisa");
      return;
    }

    const jaExiste = elencoTemp.some(
      (j) => j.userId === novoUserId
    );

    if (jaExiste) {
      alert("Jogador já está no elenco");
      return;
    }

    setElencoTemp((prev) => [
      ...prev,
      { userId: novoUserId, camisa: Number(novaCamisa) },
    ]);

    setNovoUserId("");
    setNovaCamisa("");
  }

  // ===============================
  // SALVAR CLUBE
  // ===============================
  async function salvarAlteracoes() {
    try {
      const ref = doc(db, "clubes", clube.id);

      const dadosAtualizados = {
        bio: bioTemp,
        statusMercado: statusTemp,
        elenco: elencoTemp,
        atualizadoEm: serverTimestamp(),
      };

      await updateDoc(ref, dadosAtualizados);

      setClube((prev) => ({ ...prev, ...dadosAtualizados }));
      setEditando(false);
      alert("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar clube:", error);
      alert("Erro ao salvar alterações");
    }
  }

  // ===============================
  // CRIAR CLUBE
  // ===============================
  async function criarClube(e) {
    e.preventDefault();

    if (!nomeClube || !usernameClube) {
      alert("Preencha nome e username do clube");
      return;
    }

    try {
      setCriando(true);

      const clubesRef = collection(db, "clubes");
      const docRef = await addDoc(clubesRef, {
        nome: nomeClube,
        username: usernameClube,
        bio: "",
        plataforma,
        statusMercado: "aberto",
        presidenteId: usuario.uid,
        verificado: false,
        whatsapp: "",
        instagram: "",
        elenco: [],
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      await updateDoc(doc(db, "usuarios", usuario.uid), {
        clubeId: docRef.id,
        status: "em_clube",
        atualizadoEm: serverTimestamp(),
      });

      setClubeIdUsuario(docRef.id);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar clube");
    } finally {
      setCriando(false);
    }
  }

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return <div style={{ padding: 40 }}>Carregando...</div>;
  }

  // ===============================
  // MODO CRIAR CLUBE
  // ===============================
  if (!clubeIdUsuario) {
    return (
      <main className={styles.container}>
        <section className={styles.header}>
          <h1 className={styles.title}>Criar meu clube</h1>
          <p className={styles.subtitle}>
            Complete os dados para começar
          </p>
        </section>

        <section className={styles.section}>
          <form onSubmit={criarClube}>
            <input
              className={styles.input}
              placeholder="Nome do clube"
              value={nomeClube}
              onChange={(e) => setNomeClube(e.target.value)}
            />

            <input
              className={styles.input}
              placeholder="Username"
              value={usernameClube}
              onChange={(e) => setUsernameClube(e.target.value)}
            />

            <select
              className={styles.select}
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
            >
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
            </select>

            <button
              className={styles.saveBtn}
              type="submit"
              disabled={criando}
            >
              {criando ? "Criando clube..." : "Criar clube"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  // ===============================
  // CLUBE NORMAL
  // ===============================
  if (!clube) {
    return <div style={{ padding: 40 }}>Clube não encontrado</div>;
  }

  return (
    <main className={styles.container}>
      {/* HEADER */}
      <section className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>
              {clube.nome}
              {clube.verificado && (
                <span className={styles.badge}>Verificado</span>
              )}
            </h1>

            <p className={styles.subtitle}>
              @{clube.username} • {clube.plataforma}
            </p>

            <p className={styles.subtitle}>
              Mercado: {clube.statusMercado}
            </p>
          </div>

          {isPresidente && (
            <button
              className={styles.editBtn}
              onClick={() => setEditando(!editando)}
            >
              {editando ? "Cancelar" : "Editar clube"}
            </button>
          )}
        </div>
      </section>

      {/* BIO */}
      <section className={styles.section}>
        <h2>Sobre o clube</h2>
        {editando ? (
          <textarea
            className={styles.textarea}
            value={bioTemp}
            onChange={(e) => setBioTemp(e.target.value)}
          />
        ) : (
          <p>{clube.bio || "Sem descrição."}</p>
        )}
      </section>

      {/* STATUS */}
      <section className={styles.section}>
        <h2>Status no mercado</h2>
        {editando ? (
          <select
            className={styles.select}
            value={statusTemp}
            onChange={(e) => setStatusTemp(e.target.value)}
          >
            <option value="aberto">Aberto</option>
            <option value="fechado">Fechado</option>
          </select>
        ) : (
          <p>{clube.statusMercado}</p>
        )}
      </section>

      {/* ELENCO */}
      <section className={styles.section}>
        <h2>Elenco</h2>

        {editando && (
          <div className={styles.addJogador}>
            <input
              className={styles.input}
              placeholder="UID do jogador"
              value={novoUserId}
              onChange={(e) => setNovoUserId(e.target.value)}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Camisa"
              value={novaCamisa}
              onChange={(e) => setNovaCamisa(e.target.value)}
            />
            <button type="button" onClick={adicionarJogador}>
              Adicionar
            </button>
          </div>
        )}

        <div className={styles.elencoGrid}>
          {elencoDetalhado.map((jogador, index) => (
            <div key={jogador.userId} className={styles.jogadorCard}>
              <div className={styles.jogadorNome}>
                {jogador.nome || jogador.username}
              </div>

              <div className={styles.camisa}>
                Camisa {jogador.camisa}
              </div>

              {editando && (
                <button
                  className={styles.removeBtn}
                  onClick={() => removerJogador(index)}
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* COMUNICAÇÃO */}
      <section className={styles.section}>
        <h2>Comunicação</h2>
        <p>WhatsApp: {clube.whatsapp || "Não informado"}</p>
        <p>Instagram: {clube.instagram || "Não informado"}</p>
      </section>

      {editando && isPresidente && (
        <button className={styles.saveBtn} onClick={salvarAlteracoes}>
          Salvar alterações
        </button>
      )}
    </main>
  );
}
