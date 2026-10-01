import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/fotos/logo.png";
import "../styles/Protransf.css";

import { signOut } from "firebase/auth";
import { auth } from "../../../services/firebase";
import { useAuth } from "../../../services/AuthContext";
import { ouvirPendentesParaResponder } from "../../../services/convitesService";
import { useEffect, useRef, useState } from "react";

const navClass = ({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`;

export default function Header() {
  const { user, clube, ehPresidente, ehAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendentes, setPendentes] = useState(0);

  const menuRef = useRef(null);
  const navigate = useNavigate();

  const clubeId = clube ? clube.id : null;
  const clubePresidido = ehPresidente ? clube.id : null;

  // 🔔 Convites aguardando minha resposta
  useEffect(() => {
    if (!user) {
      setPendentes(0);
      return;
    }
    return ouvirPendentesParaResponder(user.uid, clubePresidido, setPendentes);
  }, [user, clubePresidido]);

  // 🖱️ Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // 🔒 Bloquear scroll quando menu aberto (mobile)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut(auth);
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
        <div className="header-inner shell">
        {/* ESQUERDA */}
        <div className="header-left">
          <Link to="/" className="brand" onClick={closeMenu}>
            <div className="brand-logo">
              <img src={logo} alt="Pro Transfer" />
            </div>
            <span className="brand-title">Pro Transfer</span>
          </Link>

          {/* BOTÃO HAMBÚRGUER (MOBILE) */}
          <button
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* MENU / NAV */}
        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" end className={navClass} onClick={closeMenu}>
            Início
          </NavLink>

          <NavLink to="/transferencias" className={navClass} onClick={closeMenu}>
            Mercado
          </NavLink>

          <NavLink to="/ranking" className={navClass} onClick={closeMenu}>
            Ranking
          </NavLink>

          {user && (
            <NavLink to={`/jogador/${user.uid}`} className={navClass} onClick={closeMenu}>
              Meu Perfil
            </NavLink>
          )}

          {user && (
            <NavLink
              to={clubeId ? `/clube/${clubeId}` : "/clube"}
              className={navClass}
              onClick={closeMenu}
            >
              {clubeId ? "Meu Clube" : "Criar Clube"}
            </NavLink>
          )}

          {user && (
            <NavLink to="/convites" className={navClass} onClick={closeMenu}>
              Convites
              {pendentes > 0 && <span className="nav-count">{pendentes}</span>}
            </NavLink>
          )}

          {ehAdmin && (
            <NavLink to="/admin/solicitacoes" className={navClass} onClick={closeMenu}>
              Admin
            </NavLink>
          )}

          {/* AÇÕES (APENAS MENU MOBILE) */}
          {user ? (
            <button onClick={handleLogout} className="btn-logout menu-logout">
              Sair
            </button>
          ) : (
            <Link to="/login" className="btn-login menu-logout" onClick={closeMenu}>
              Entrar
            </Link>
          )}
        </nav>

        {/* AÇÕES (DESKTOP) */}
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
        </div>
      </header>
    </>
  );
}
