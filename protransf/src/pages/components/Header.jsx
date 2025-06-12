import React from "react";
import { Link } from "react-router-dom";


function Header() {
  return (
    <header>
      <div className="logo">PRO<span>TRANSF</span></div>
      <nav>
        <Link to="/transferencias">Transferências</Link>
        <Link to="/jogador">Jogador</Link>
        <Link to="/clube">Clubes</Link>
        <Link to="/ranking">Ranking</Link>
        <Link to="/cadastro">Cadastrar-se</Link>
      </nav>
      <Link to="/login" className="btn-login">Entrar</Link>
    </header>
  );
}

export default Header;
