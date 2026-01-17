import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import Home from "./features/home/pages/Protransf";
import Transferencia from "./features/transferencias/pages/Transferencia";
import Cadastro from "./features/Cadastro/pages/Cadastro";
import Login from "./features/auth/pages/Login";
import PerfilPage from "./features/perfil/pages/PerfilPage";
import RankingPage from "./features/ranking/pages/Ranking";
import Jogador from "./features/Jogador/Pages/Jogador";
import "./features/home/styles/Protransf.css";
import Header from "./features/home/components/Header";


function AppContent() {
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

        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/perfil/:id" element={<PerfilPage />} />

        <Route path="/jogador/:id" element={<Jogador />} />


        <Route path="/ranking" element={<RankingPage />} />
      </Routes>
    </>
  );
}


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
