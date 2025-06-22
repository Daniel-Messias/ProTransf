import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./services/firebase";

import "./style.css";
import bola from "../src/assets/fotos/bola.png";

import Home from "./features/home/pages/Protransf";
import Transferencia from "./features/transferencias/pages/Transferencia";
import Cadastro from "./features/Cadastro/pages/Cadastro";
import Login from "./features/auth/pages/Login";
import PerfilJogadorPage from "./features/jogador/pages/PerfilJogadorPage";
import PerfilClubePage from "./features/clube/pages/PerfilClubePage";
import RankingPage from "../src/features/ranking/pages/Ranking";
import PerfilPublicoJogador from "./features/jogador/pages/PerfilPublicoJogador";

function Header({ user, tipo }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const isJogador = tipo === "jogador";
  const isClubeJogador = tipo === "clube_jogador";
  const isVisitante = !user;

  return (
    <header>
      <Link to="/" className="logo">
        PR<img src={bola} alt="Bola" className="logo-bola" />
        <span>TRANSFER</span>
      </Link>

      <nav>
        {/* Visitante (não logado) */}
        {isVisitante && (
          <>
            <Link to="/clube">Clube</Link>
            <Link to="/transferencias">Transferências</Link>
            <Link to="/jogador">Jogador</Link>
            <Link to="/ranking">Ranking</Link>
            <Link to="/cadastro">Cadastrar-se</Link>
          </>
        )}

        {/* Jogador */}
        {user && isJogador && (
          <>
            <Link to="/transferencias">Transferências</Link>
            <Link to="/jogador">Perfil</Link>
            <Link to="/ranking">Ranking</Link>
          </>
        )}

        {/* Clube + Jogador */}
        {user && isClubeJogador && (
          <>
            <Link to="/clube">Clube</Link>
            <Link to="/transferencias">Transferências</Link>
            <Link to="/jogador">Perfil</Link>
            <Link to="/ranking">Ranking</Link>
          </>
        )}
      </nav>

      {!user ? (
        <Link to="/login" className="btn-login">
          Entrar
        </Link>
      ) : (
        <button onClick={handleLogout} className="btn-login">
          Sair
        </button>
      )}
    </header>
  );
}

function LayoutRoutes() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const docRef = doc(db, "usuarios", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTipo(docSnap.data().tipo || null);
          } else {
            setTipo(null);
          }
        } catch (error) {
          console.error("Erro ao buscar tipo de usuário:", error);
          setTipo(null);
        }
      } else {
        setTipo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const hideHeaderOnRoutes = ["/login"];
  const hideHeader = hideHeaderOnRoutes.includes(location.pathname);

  return (
    <div className="imagem-fundo">
      {!hideHeader && <Header user={user} tipo={tipo} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transferencias" element={<Transferencia />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jogador" element={<PerfilJogadorPage />} />
        <Route path="/clube" element={<PerfilClubePage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/perfil-jogador/:id" element={<PerfilPublicoJogador />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LayoutRoutes />
    </Router>
  );
}

export default App;
