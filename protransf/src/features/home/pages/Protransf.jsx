import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../services/firebase";
import { buscarJogadores } from "../../../services/firestoreService";
import { doc, getDoc, collection, limit, query, orderBy, getDocs } from "firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import UltimasTransferencias from "../components/UltimasTransferencias";
import logo from "../../../assets/fotos/logo.png";
import CampoRealista from "../../../assets/fotos/CampoRealista.png";


export default function Home() {
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [jogadores, setJogadores] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formEnviado, setFormEnviado] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Atualizar ano no footer
    const yearElement = document.getElementById("year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, "usuarios", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          setTipo(docSnap.exists() ? docSnap.data().tipo : null);
        } catch (error) {
          console.error("Erro ao buscar tipo do usuário:", error);
          setTipo(null);
        }
      } else {
        setTipo(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function carregarClubes() {
      try {
        const q = query(collection(db, "clubes"), limit(4));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map((doc, i) => ({
          id: doc.id,
          ...doc.data(),
          pontos: 70 - i * 4
        }));
        setClubes(lista);
      } catch (error) {
        console.error("Erro ao buscar clubes:", error);
      }
    }
    carregarClubes();
  }, []);

  useEffect(() => {
    async function carregarJogadores() {
      setLoading(true);
      try {
        const jogadoresReais = await buscarJogadores();
        setJogadores(jogadoresReais);
      } catch (error) {
        console.error("Erro ao buscar jogadores:", error);
      }
      setLoading(false);
    }
    carregarJogadores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nome = e.target.nome.value;
    const email = e.target.email.value;
    const mensagem = e.target.mensagem.value;

    try {
      await addDoc(collection(db, "mensagensContato"), {
        nome,
        email,
        mensagem,
        enviadoEm: serverTimestamp(),
      });

      setFormEnviado(true);
      setTimeout(() => setFormEnviado(false), 3000);
      e.target.reset();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="bg-image"></div>
        <div className="bg-overlay"></div>
        <div className="shell">
          <p style={{ textAlign: "center", color: "#e5e7eb", padding: "2rem" }}>
            Carregando jogadores...
          </p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="page">
      <div className="bg-image"></div>
      <div className="bg-overlay"></div>

      <div className="shell">
       

        {/* MAIN LAYOUT */}
        <main className="layout">
          {/* COLUNA PRINCIPAL */}
          <section className="main-panel">
            {/* HERO */}
            <div className="hero">
              <div className="hero-tag">Plataforma de transferências de Pro Clubs</div>
              <h1 className="hero-title">
                A plataforma que conecta <span>jogadores</span> e <span>clubes</span> de Pro Clubs em um único lugar.
              </h1>
              <p className="hero-subtitle">
                Cadastre jogadores e clubes do EA FC 26+ para organizar transferências sem depender de grupos de redes sociais.
              </p>

              <div className="hero-cta">
                {!user ? (
                  <>
                    <Link to="/cadastro" className="btn btn-primary">
                      Sou jogador
                    </Link>
                    <Link to="/cadastro-clube" className="btn btn-outline">
                      Sou clube
                    </Link>
                  </>
                ) : (
                  <Link to={tipo === "jogador" ? "/meu-perfil" : "/clube"} className="btn btn-primary">
                    Meu Perfil
                  </Link>
                )}
              </div>

              <div className="hero-microcopy">Cadastro gratuito para jogadores e clubes.</div>
              <div className="hero-note">Foco em ligas e federações organizadas de Pro Clubs.</div>
            </div>

            {/* SEÇÃO COMO FUNCIONA */}
            <section className="mini-section">
              <div className="mini-title">Como funciona</div>
              <div className="mini-text">
                A Pro Transfer centraliza perfis de jogadores e clubes para facilitar contratações de Pro Clubs.
              </div>
              <div className="mini-steps">
                <div className="mini-step">1. Crie sua conta como jogador ou clube.</div>
                <div className="mini-step">2. Preencha posição, overall, horários ou vagas.</div>
                <div className="mini-step">3. Use os filtros internos para encontrar a outra ponta.</div>
              </div>
            </section>
          </section>

          {/* SIDEBAR */}
          <aside className="sidebar">
            {/* CARD RANKING */}
            <div className="sidebar-card">
              <div className="sidebar-header">
                <span className="sidebar-title">Top Clubes</span>
                <span className="sidebar-badge">Ao vivo</span>
              </div>
              <ul className="market-list ranking-list">
                {clubes.map((clube, i) => (
                  <li
                    key={clube.id}
                    className="market-item ranking-item"
                    onClick={() => navigate(`/perfil/${clube.id}`)}
                  >
                    <span className="pos">{i + 1}</span>
                    <span className="team-name">{clube.nome}</span>
                    <span className="pontos">{clube.pontos} pts</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CARD ÚLTIMAS TRANSFERÊNCIAS */}
            <div className="sidebar-card">
              <div className="sidebar-header">
                <span className="sidebar-title">Últimas Transferências</span>
                <span className="sidebar-badge">Ao vivo</span>
              </div>
              <div className="transferencias-container">
                <UltimasTransferencias />
              </div>
            </div>
          </aside>
        </main>
        {/* FOOTER */}
        <footer className="main-footer">
          © <span id="year"></span> Pro Transfer — plataforma independente focada em Pro Clubs no EA FC.
        </footer>
      </div>
    </div>

  );
}