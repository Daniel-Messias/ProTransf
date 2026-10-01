import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./services/AuthContext";

import Home from "./features/home/pages/Protransf";
import Transferencia from "./features/transferencias/pages/Transferencia";
import Convites from "./features/transferencias/pages/Convites";
import Cadastro from "./features/cadastro/pages/Cadastro";
import Login from "./features/auth/pages/Login";
import RankingPage from "./features/ranking/pages/Ranking";
import Jogador from "./features/Jogador/pages/Jogador";
import "./features/home/styles/Protransf.css";
import Header from "./features/home/components/Header";
import Clube from "./features/clubes/pages/clube";
import AdminSolicitacoes from "./features/admin/pages/AdminSolicitacoes";
import Loader from "./components/Loader";
import ToastHost from "./components/ToastHost";

function AppContent() {
  const location = useLocation();
  const { user, ehAdmin, carregando } = useAuth();

  const rotasSemMenu = ["/login", "/cadastro"];
  const esconderMenu = rotasSemMenu.includes(location.pathname);

  if (carregando) return <Loader telaCheia texto="Entrando em campo..." />;

  return (
    <>
      {!esconderMenu && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transferencias" element={<Transferencia />} />
        <Route
          path="/convites"
          element={user ? <Convites /> : <Navigate to="/login" replace />}
        />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />

        <Route path="/jogador/:id" element={<Jogador />} />
        <Route path="/clube/:id" element={<Clube />} />
        <Route path="/clube" element={<Clube />} />

        <Route
          path="/admin/solicitacoes"
          element={ehAdmin ? <AdminSolicitacoes /> : <Navigate to="/" replace />}
        />

        <Route path="/ranking" element={<RankingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastHost />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
