import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/fotos/logo.png";
import "../styles/Protransf.css";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../services/firebase";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [clubeId, setClubeId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
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

  // 🔥 FECHAR AO CLICAR FORA
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    setClubeId(null);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`menu-overlay ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
      />

      <header className="main-header" ref={menuRef}>
        {/* ESQUERDA */}
        <div className="header-left">
          <Link to="/" className="brand" onClick={closeMenu}>
            <div className="brand-logo">
              <img src={logo} alt="Pro Transfer" />
            </div>
            <span className="brand-title">Pro Transfer</span>
          </Link>

          {/* BOTÃO MOBILE */}
          <button
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* NAV */}
        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Início</Link>
          <Link to="/transferencias" className="nav-link" onClick={closeMenu}>Mercado</Link>

          {user && (
            <Link
              to={`/jogador/${user.uid}`}
              className="nav-link"
              onClick={closeMenu}
            >
              Meu Perfil
            </Link>
          )}

          {clubeId && (
            <Link
              to={`/clube/${clubeId}`}
              className="nav-link"
              onClick={closeMenu}
            >
              Meu Clube
            </Link>
          )}

          <Link to="/ranking" className="nav-link" onClick={closeMenu}>
            Ranking
          </Link>
        </nav>

        {/* AÇÕES */}
        <div className="header-actions">
          {!user ? (
            <Link to="/login" className="btn-login" onClick={closeMenu}>
              Entrar
            </Link>
          ) : (
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          )}
        </div>
      </header>
    </>
  );
}
