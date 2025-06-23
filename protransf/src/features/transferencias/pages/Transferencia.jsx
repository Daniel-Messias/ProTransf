import React, { useEffect, useState } from "react";
import styles from "../transferencia.module.css";
import { db, auth } from "../../../services/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";

const Transferencia = () => {
  const [transferencias, setTransferencias] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroPosicao, setFiltroPosicao] = useState("");
  const [userPerfil, setUserPerfil] = useState(null);
  const [enviandoConvite, setEnviandoConvite] = useState(false);

  // Busca perfil do usuário logado
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const q = query(collection(db, "usuarios"), where("uid", "==", firebaseUser.uid));
          const querySnapshot = await getDocs(q);
          let perfil = null;
          querySnapshot.forEach((doc) => {
            perfil = { id: doc.id, ...doc.data() };
          });
          setUserPerfil(perfil);
        } catch (error) {
          console.error("Erro ao buscar perfil do usuário:", error);
          setUserPerfil(null);
        }
      } else {
        setUserPerfil(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Últimas 5 transferências
  useEffect(() => {
    const q = query(collection(db, "convites"), orderBy("criadoEm", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransferencias(data);
    });

    return () => unsubscribe();
  }, []);

  // Busca jogadores
  useEffect(() => {
    const q = query(
      collection(db, "usuarios"),
      where("tipoUsuario", "==", "jogador"),
      orderBy("username"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJogadores(data);
    });

    return () => unsubscribe();
  }, []);

  // Busca clubes
  useEffect(() => {
    const q = query(
      collection(db, "usuarios"),
      where("tipoUsuario", "in", ["clube", "clube_jogador"]),
      orderBy("clubeNome"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClubes(data);
    });

    return () => unsubscribe();
  }, []);

  const jogadoresFiltrados = jogadores.filter((j) => {
    const nomeMatch = j.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const posicaoMatch = filtroPosicao
      ? j.posicao?.toLowerCase() === filtroPosicao.toLowerCase()
      : true;
    return nomeMatch && posicaoMatch;
  });

  const clubesFiltrados = clubes.filter((c) =>
    c.clubeNome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function enviarConvite(jogador) {
    if (!userPerfil || !userPerfil.clubeId) {
      alert("Você precisa estar logado como clube para enviar convites.");
      return;
    }

    setEnviandoConvite(true);
    try {
      await addDoc(collection(db, "convites"), {
        clubeId: userPerfil.clubeId,
        clubeNome: userPerfil.clubeNome,
        jogadorUsername: jogador.username,
        jogadorEmail: jogador.email,
        posicao: jogador.posicao,
        plataforma: jogador.plataforma,
        status: "pendente",
        criadoEm: serverTimestamp(),
        respondidoEm: null,
      });
      alert(`Convite enviado para ${jogador.username || jogador.email}!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar convite.");
    } finally {
      setEnviandoConvite(false);
    }
  }

  async function enviarPedido(clube) {
    if (!userPerfil || userPerfil.tipoUsuario !== "jogador") {
      alert("Você precisa estar logado como jogador para enviar pedido.");
      return;
    }

    setEnviandoConvite(true);
    try {
      await addDoc(collection(db, "pedidos"), {
        jogadorId: userPerfil.id,
        jogadorUsername: userPerfil.username,
        jogadorEmail: userPerfil.email,
        posicao: userPerfil.posicao,
        plataforma: userPerfil.plataforma,
        clubeId: clube.clubeId || clube.id,
        clubeNome: clube.clubeNome || clube.nome,
        status: "pendente",
        criadoEm: serverTimestamp(),
        respondidoEm: null,
      });
      alert(`Pedido enviado para o clube ${clube.clubeNome || clube.nome}!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar pedido.");
    } finally {
      setEnviandoConvite(false);
    }
  }

  return (
    <div className={styles.flexColumn}>
      <main className={styles.main}>
        <h1 className={styles.h1}>Transferências</h1>

        <div className={styles.filtrosContainer}>
          <input
            type="text"
            placeholder="Buscar jogador ou clube..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={filtroPosicao}
            onChange={(e) => setFiltroPosicao(e.target.value)}
            className={styles.searchInput}
          >
            <option value="">Todas as posições</option>
            <option value="goleiro">Goleiro</option>
            <option value="zagueiro">Zagueiro</option>
            <option value="lateral">Lateral</option>
            <option value="volante">Volante</option>
            <option value="meia">Meia</option>
            <option value="atacante">Atacante</option>
          </select>
        </div>

        {/* Lista de jogadores para clube logado */}
        {userPerfil?.tipoUsuario === "clube" || userPerfil?.tipoUsuario === "clube_jogador" ? (
          <>
            <h2 className={styles.sectionTitle}>Jogadores disponíveis</h2>
            {jogadoresFiltrados.length === 0 ? (
              <p style={{ color: "#ccc" }}>Nenhum jogador encontrado.</p>
            ) : (
              jogadoresFiltrados.map((jogador) => (
                <div key={jogador.id} className={styles.jogadorItem}>
                  <span>
                    <strong>{jogador.username}</strong> ({jogador.posicao} - {jogador.plataforma})
                  </span>
                  <button
                    disabled={enviandoConvite}
                    className={styles.btnEnviarConvite}
                    onClick={() => enviarConvite(jogador)}
                  >
                    {enviandoConvite ? "Enviando..." : "Enviar convite"}
                  </button>
                </div>
              ))
            )}
          </>
        ) : null}

        {/* Lista de clubes para jogador logado */}
        {userPerfil?.tipoUsuario === "jogador" ? (
          <>
            <h2 className={styles.sectionTitle}>Clubes disponíveis</h2>
            {clubesFiltrados.length === 0 ? (
              <p style={{ color: "#ccc" }}>Nenhum clube encontrado.</p>
            ) : (
              clubesFiltrados.map((clube) => (
                <div key={clube.id} className={styles.jogadorItem}>
                  <span>
                    <strong>{clube.clubeNome}</strong>
                  </span>
                  <button
                    disabled={enviandoConvite}
                    className={styles.btnEnviarConvite}
                    onClick={() => enviarPedido(clube)}
                  >
                    {enviandoConvite ? "Enviando..." : "Enviar pedido"}
                  </button>
                </div>
              ))
            )}
          </>
        ) : null}

        {/* Transferências em formato de card */}
        <section className={styles.transferenciasCards}>
          <h2 className={styles.sectionTitle}>Últimas Transferências</h2>
          {transferencias.length === 0 ? (
            <p style={{ color: "#ccc" }}>Nenhuma transferência encontrada.</p>
          ) : (
            transferencias.map((item) => (
              <div key={item.id} className={styles.cardTransferencia}>
                <div className={styles.cardConteudo}>
                  <strong>{item.clubeNome}</strong>
                 <span className={styles.setaTransferencia}>⇄</span>
                  <strong>{item.jogadorUsername || item.jogadorEmail}</strong>
                </div>
                <div className={styles.cardInfoSecundaria}>
                  {item.posicao} | {item.plataforma}
                  <span className={styles[`status${item.status?.toLowerCase()}`]}>
                    {item.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <a href="/" className={styles.footerLink}>
          Política de Privacidade
        </a>
        <a href="/" className={styles.footerLink}>
          Termos de Uso
        </a>
      </footer>
    </div>
  );
};

export default Transferencia;
