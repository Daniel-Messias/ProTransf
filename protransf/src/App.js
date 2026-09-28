import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

import { auth } from "./services/firebase";

import Home from "./features/home/pages/Protransf";
import Transferencia from "./features/transferencias/pages/Transferencia";
import Cadastro from "./features/cadastro/pages/Cadastro";
import Login from "./features/auth/pages/Login";
import RankingPage from "./features/ranking/pages/Ranking";
import Jogador from "./features/Jogador/pages/Jogador";
import "./features/home/styles/Protransf.css";
import Header from "./features/home/components/Header";
import Clube from "./features/clubes/pages/clube";
import AdminSolicitacoes from "./features/admin/pages/AdminSolicitacoes";

import { onAuthStateChanged } from "firebase/auth";

const ADMIN_UIDS = ["Am6psnQw80fyw5GLfKqj8tnjyBz2"];

function ehAdmin(user) {
  return !!user && ADMIN_UIDS.includes(user.uid);
}

function AppContent({ user }) {
  const location = useLocation();

  const rotasSemMenu = ["/login", "/cadastro"];
  const esconderMenu = rotasSemMenu.includes(location.pathname);

  return (
    <>
      {!esconderMenu && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transferencias" element={<Transferencia />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />

        <Route path="/jogador/:id" element={<Jogador />} />
        <Route path="/clube/:id" element={<Clube />} />
        <Route path="/clube" element={<Clube />} />

        <Route
          path="/admin/solicitacoes"
          element={
            ehAdmin(user)
              ? <AdminSolicitacoes usuario={user} />
              : <Navigate to="/" replace />
          }
        />

        <Route path="/ranking" element={<RankingPage />} />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setCarregandoAuth(false);
    });
    return () => unsub();
  }, []);

  if (carregandoAuth) return <div>Carregando...</div>;

  return (
    <Router>
      <AppContent user={user} />
    </Router>
  );
}

export default App;
