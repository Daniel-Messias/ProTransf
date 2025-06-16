import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './services/firebase'; // ajuste o caminho se necessário

import './style.css';
import bola from "../src/assets/fotos/bola.png";

import Home from './features/home/pages/Protransf';
import Transferencia from './features/transferencias/pages/Transferencia';
import Cadastro from './features/Cadastro/pages/Cadastro';
import Login from './features/auth/pages/Login';
import PerfilJogadorPage from './features/jogador/pages/PerfilJogadorPage';
import PerfilClubePage from './features/clube/pages/PerfilClubePage';
import RankingPage from '../src/features/ranking/pages/Ranking';

function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header>
      <Link to="/" className="logo">
        PR<img src={bola} alt="Bola" className="logo-bola" /><span>TRANSFER</span>
      </Link>

      <nav>
        <Link to="/clube">Clube</Link>
        <Link to="/transferencias">Transferências</Link>
        <Link to="/jogador">{user ? "Perfil" : "Jogador"}</Link>
        <Link to="/ranking">Ranking</Link>
        {!user && <Link to="/cadastro">Cadastrar-se</Link>}
      </nav>

      {!user ? (
        <Link to="/login" className="btn-login">Entrar</Link>
      ) : (
        <button onClick={handleLogout} className="btn-login">Sair</button>
      )}
    </header>
  );
}

// Gerencia rotas e controle de header
function LayoutRoutes() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const hideHeaderOnRoutes = ["/login"];
  const hideHeader = hideHeaderOnRoutes.includes(location.pathname);

  return (
    <div className="imagem-fundo">
      {!hideHeader && <Header user={user} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transferencias" element={<Transferencia />} />
        <Route path="/cadastro" element={<Cadastro />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/jogador" element={<PerfilJogadorPage />} />
        <Route path="/clube" element={<PerfilClubePage />} />
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
