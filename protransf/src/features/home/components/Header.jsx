import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/fotos/logo.png";
import "../styles/Protransf.css";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../services/firebase";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [clubeId, setClubeId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      setUser(usuario);

      if (!usuario) {
        setClubeId(null);
        return;
      }

      try {
        const refUsuario = doc(db, "usuarios", usuario.uid);
        const snap = await getDoc(refUsuario);

        if (snap.exists()) {
          const dados = snap.data();
          setClubeId(dados.clubeId || null);
        } else {
          setClubeId(null);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        setClubeId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setClubeId(null);
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
        <Link to="/transferencias" className="nav-link">Mercado</Link>

        {user && (
          <Link to={`/jogador/${user.uid}`} className="nav-link">
            Meu Perfil
          </Link>
        )}

        {clubeId && (
          <Link to={`/clube/${clubeId}`} className="nav-link">
            Meu Clube
          </Link>
        )}

        <Link to="/ranking" className="nav-link">Ranking</Link>
      </nav>

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
