import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './style.css';

import Home from "./pages/Protransf";
import Transferencias from "./pages/Transferencia";
import Cadastro from "./pages/Cadastro"; 

function Header() {
  return (
    <header>
      <div className="logo">PRO<span>TRANSF</span></div>
      <nav>
        <Link to="/transferencias">Transferências</Link>
        <Link to="/jogador">Jogador</Link>
        <Link to="/clube">Clubes</Link>
        <Link to="/ranking">Ranking</Link>
        <Link to="/cadastro">Cadastrar-se</Link> {/* ✅ NOVO */}
      </nav>
      <Link to="/login" className="btn-login">Entrar</Link>
    </header>
  );
}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transferencias" element={<Transferencias />} />
        <Route path="/cadastro" element={<Cadastro />} /> {/* ✅ NOVO */}
        {/* Outras rotas aqui */}
      </Routes>
    </Router>
  );
}

export default App;
