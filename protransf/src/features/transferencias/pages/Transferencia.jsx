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

  // Busca perfil do usuário logado para detectar tipoUsuario e clube
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

  // Busca últimas 5 transferências (convites) e adiciona username do jogador via email
  useEffect(() => {
    const q = query(
      collection(db, "convites"),
      orderBy("criadoEm", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convitesData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const convite = docSnap.data();

          // Busca username do jogador via email
          const usuariosRef = collection(db, "usuarios");
          const qUser = query(
            usuariosRef,
            where("email", "==", convite.jogadorEmail)
          );
          const queryUserSnapshot = await getDocs(qUser);

          let jogadorUsername = "N/A";
          if (!queryUserSnapshot.empty) {
            jogadorUsername = queryUserSnapshot.docs[0].data().username || "N/A";
          }

          return {
            id: docSnap.id,
            ...convite,
            jogadorUsername,
          };
        })
      );

      setTransferencias(convitesData);
    });

    return () => unsubscribe();
  }, []);

  // Busca jogadores (tipoUsuario: jogador) ativos
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

  // Busca clubes (tipoUsuario: clube) ativos
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

  // Filtra jogadores e clubes de acordo com pesquisa e posição
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

  // Função enviar convite de clube para jogador
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
      alert(`Convite enviado para ${jogador.username}!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar convite.");
    } finally {
      setEnviandoConvite(false);
    }
  }

  // Função enviar pedido de jogador para clube
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
    <div
      className={`${styles.flex} ${styles["flex-col"]} ${styles["min-h-screen"]}`}
    >
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

        {/* Se for clube logado: lista jogadores com botão enviar convite */}
        {(userPerfil?.tipoUsuario === "clube" || userPerfil?.tipoUsuario === "clube_jogador") && (
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
        )}

        {/* Se for jogador logado: lista clubes com botão enviar pedido */}
        {userPerfil?.tipoUsuario === "jogador" && (
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
        )}

        <section className={styles.jogadoresProcurando}>
          <h2 className={styles.sectionTitle}>Últimas 5 Transferências</h2>
          {transferencias.length === 0 ? (
            <p style={{ color: "#ccc" }}>Nenhuma transferência encontrada.</p>
          ) : (
            transferencias.map((item) => (
              <div key={item.id} className={styles.jogadorItem}>
                <span>
                  <strong>{item.clubeNome}</strong> →{" "}
                  <strong>{item.jogadorUsername}</strong> ({item.posicao} - {item.plataforma})
                </span>
                <span className={styles[`status${item.status?.toLowerCase()}`]}>
                  {item.status?.toUpperCase()}
                </span>
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
