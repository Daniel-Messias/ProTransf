import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './style.css';


import Home from "./pages/Protransf";
import Transferencias from "./pages/Transferencia";
// importe as outras páginas que criar

function Header() {
  return (
    <header>
      <div className="logo">PRO<span>TRANSF</span></div>
      <nav>
        <Link to="/transferencias">Transferências</Link>
        <Link to="/jogador">Jogador</Link>
        <Link to="/clube">Clubes</Link>
        <Link to="/ranking">Ranking</Link>
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
        {/* Outras rotas aqui */}
      </Routes>
    </Router>
  );
}

export default App;
