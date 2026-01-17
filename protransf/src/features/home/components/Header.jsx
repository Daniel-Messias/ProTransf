import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/fotos/logo.png";
import "../styles/Protransf.css";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../services/firebase";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <Link to="/" className="brand">
        <div className="brand-logo">
            <img src={logo} alt="Pro Transfer" />
        </div>
          <span className="brand-title">Pro Transfer</span>
        </Link>
      </div>

      <nav className="main-nav">
        <Link to="/" className="nav-link">Início</Link>
        <Link to="/Transferencias" className="nav-link">Mercado</Link>
         {user && (
    <Link to={`/jogador/${user.uid}`} className="nav-link">
      Meu Perfil
    </Link>
  )}
        <Link to="/Clubes" className="nav-link">Clubes</Link>
        <Link to="/Ranking" className="nav-link">Ranking</Link>
      </nav>

      {/* 🔑 ÁREA DE LOGIN */}
      <div className="header-actions">
        {!user ? (
          <Link to="/login" className="btn-login">
            Entrar
          </Link>
        ) : (
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        )}
      </div>
    </header>
  );
}
