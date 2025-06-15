import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import './style.css';

import bola from "../src/assets/fotos/bola.png";
import Home from './features/home/pages/Protransf';
import Transferencia from './features/transferencias/pages/Transferencia';
import Cadastro from './features/Cadastro/pages/Cadastro';
import Login from './features/auth/pages/Login';
import PerfilJogadorPage from './features/jogador/pages/PerfilJogadorPage';
import PerfilClubePage from './features/clube/pages/PerfilClubePage';
import RankingPage from './features/ranking/RankingPage';

function Header() {
  return (
    <header>
      <Link to="/" className="logo">
        PR<img src={bola} alt="Bola" className="logo-bola" /><span>TRANSFER</span>
      </Link>

      <nav>
        <Link to="/transferencias">Transferências</Link>
        <Link to="/jogador">Jogador</Link>
        <Link to="/clube">Clube</Link>
        <Link to="/ranking">Ranking</Link>
        <Link to="/cadastro">Cadastrar-se</Link> 
      </nav>
      <Link to="/login" className="btn-login">Entrar</Link>
    </header>
  );
}

// Novo componente para gerenciar rotas com header condicional
function LayoutRoutes() {
  const location = useLocation();

  const hideHeaderOnRoutes = ["/login"];
  const hideHeader = hideHeaderOnRoutes.includes(location.pathname);

  return (
    <div className="imagem-fundo">
      {!hideHeader && <Header />}
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
