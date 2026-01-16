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

import "../src/features/home/styles/Protransf.css";
import bola from "../src/assets/fotos/bola.png";

import Home from "./features/home/pages/Protransf";
import Transferencia from "./features/transferencias/pages/Transferencia";
import Cadastro from "./features/Cadastro/pages/Cadastro";
import Login from "./features/auth/pages/Login";
import PerfilPage from "./features/perfil/pages/PerfilPage";
import RankingPage from "../src/features/ranking/pages/Ranking";

function Header({ user, tipo }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const isJogador = tipo === "jogador";
  const isClubeJogador = tipo === "clube_jogador";
  const isVisitante = !user;

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  const fecharMenu = () => {
    setMenuAberto(false);
  };

  return (
    <header>
      <div className="header-left">
        <Link to="/" className="logo" onClick={fecharMenu}>
          PR<img src={bola} alt="Bola" className="logo-bola" />
          <span>TRANSFER</span>
        </Link>
      </div>

      <button className="btn-hamburguer" onClick={toggleMenu} aria-label="Menu">
        {menuAberto ? "✕" : "☰"}
      </button>

      <nav className={`nav-links ${menuAberto ? "aberto" : ""}`}>
        <div className="links-centrais">
          {isVisitante && (
            <>
              <Link to="/transferencias" onClick={fecharMenu}>Transferências</Link>
              <Link to="/ranking" onClick={fecharMenu}>Ranking</Link>
              <Link to="/cadastro" onClick={fecharMenu}>Cadastrar-se</Link>
            </>
          )}

          {(user && (isJogador || isClubeJogador)) && (
            <>
              <Link to="/transferencias" onClick={fecharMenu}>Transferências</Link>
              <Link to="/perfil" onClick={fecharMenu}>Perfil</Link>
              <Link to="/ranking" onClick={fecharMenu}>Ranking</Link>
            </>
          )}
        </div>

        <div className="login-container">
          {!user ? (
            <Link to="/login" className="btn-login" onClick={fecharMenu}>Entrar</Link>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                fecharMenu();
              }}
              className="btn-login"
            >
              Sair
            </button>
          )}
        </div>
      </nav>
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
            const tipoUser = docSnap.data().tipo || null;
            setTipo(tipoUser);
          } else {
            setTipo(null);
          }
        } catch (error) {
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
    <div className="qualquernome">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transferencias" element={<Transferencia />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/perfil/:id" element={<PerfilPage />} />
        <Route path="/ranking" element={<RankingPage />} />
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
