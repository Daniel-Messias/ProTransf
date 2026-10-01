import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarClubes, buscarUsuarios } from "../../../services/firestoreService";
import { useAuth } from "../../../services/AuthContext";
import { prepararJogadores, rankearJogadores } from "../../../utils/ranking";
import { getNomeExibicao, idsComClube } from "../../../utils/jogador";
import UltimasTransferencias from "../components/UltimasTransferencias";

export default function Home() {
  const { user } = useAuth();
  const [topJogadores, setTopJogadores] = useState([]);
  const [numeros, setNumeros] = useState(null);
  const [carregandoTop, setCarregandoTop] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [usuarios, clubes] = await Promise.all([buscarUsuarios(), buscarClubes()]);
        const jogadores = prepararJogadores(usuarios);

        setTopJogadores(rankearJogadores(jogadores, "overall", "todos", 5));
        const ocupados = idsComClube(clubes, usuarios);
        setNumeros({
          jogadores: jogadores.length,
          livres: jogadores.filter((j) => !ocupados.has(j.id)).length,
          clubes: clubes.length,
        });
      } catch (error) {
        console.error("Erro ao carregar dados da home:", error);
      } finally {
        setCarregandoTop(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="page">
      <div className="bg-image"></div>
      <div className="bg-overlay"></div>

      <div className="shell">
        {/* MAIN LAYOUT */}
        <main className="layout">
          {/* COLUNA PRINCIPAL */}
          <section className="main-panel">
            {/* HERO */}
            <div className="hero">
              <div className="hero-tag">Plataforma de transferências de Pro Clubs</div>
              <h1 className="hero-title">
                A plataforma que conecta <span>jogadores</span> e <span>clubes</span> de Pro Clubs em um único lugar.
              </h1>
              <p className="hero-subtitle">
                Cadastre jogadores e clubes do EA FC para organizar transferências sem depender de grupos de redes sociais.
              </p>

              <div className="hero-cta">
                {!user ? (
                  <>
                    <Link to="/cadastro" className="btn btn-primary">
                      Criar minha conta
                    </Link>
                    <Link to="/transferencias" className="btn btn-outline">
                      Ver o mercado
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={`/jogador/${user.uid}`} className="btn btn-primary">
                      Meu Perfil
                    </Link>
                    <Link to="/transferencias" className="btn btn-outline">
                      Ir ao mercado
                    </Link>
                  </>
                )}
              </div>

              <div className="hero-microcopy">Cadastro gratuito para jogadores e clubes.</div>
              <div className="hero-note">Foco em ligas e federações organizadas de Pro Clubs.</div>

              {numeros && (
                <div className="hero-numeros">
                  <div><strong>{numeros.jogadores}</strong><span>jogadores</span></div>
                  <div><strong>{numeros.livres}</strong><span>livres no mercado</span></div>
                  <div><strong>{numeros.clubes}</strong><span>clubes</span></div>
                </div>
              )}
            </div>

            {/* SEÇÃO COMO FUNCIONA */}
            <section className="mini-section">
              <div className="mini-title">Como funciona</div>
              <div className="mini-text">
                A Pro Transfer centraliza perfis de jogadores e clubes para facilitar contratações de Pro Clubs.
              </div>
              <div className="mini-steps">
                <div className="mini-step">1. Crie sua conta e monte seu perfil.</div>
                <div className="mini-step">2. Envie suas estatísticas e suba no ranking.</div>
                <div className="mini-step">3. Convide jogadores ou peça para entrar num clube.</div>
              </div>
            </section>
          </section>

          {/* SIDEBAR */}
          <aside className="sidebar">
            {/* CARD RANKING */}
            <div className="sidebar-card">
              <div className="sidebar-header">
                <span className="sidebar-title">Top 5 · Overall</span>
                <Link to="/ranking" className="sidebar-link">
                  Ver ranking →
                </Link>
              </div>

              {carregandoTop ? (
                <p className="transferencias-loading">Carregando ranking...</p>
              ) : topJogadores.length === 0 ? (
                <p className="transferencias-empty">
                  Ninguém no ranking ainda. Envie suas estatísticas!
                </p>
              ) : (
                <ol className="market-list">
                  {topJogadores.map((j, i) => (
                    <li key={j.id}>
                      <Link to={`/jogador/${j.id}`} className="market-item ranking-item">
                        <span className="pos">{i + 1}</span>
                        <span className="team-name">{getNomeExibicao(j)}</span>
                        <span
                          className="pontos ovr-chip"
                          style={{ "--cor-raridade": j.raridade.corPrincipal }}
                        >
                          {j.overall}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* CARD ÚLTIMAS TRANSFERÊNCIAS */}
            <div className="sidebar-card">
              <div className="sidebar-header">
                <span className="sidebar-title">Últimas Transferências</span>
                <span className="sidebar-badge">Ao vivo</span>
              </div>
              <div className="transferencias-container">
                <UltimasTransferencias />
              </div>
            </div>
          </aside>
        </main>
        {/* FOOTER */}
        <footer className="main-footer">
          © {new Date().getFullYear()} Pro Transfer — plataforma independente focada em Pro Clubs no EA FC.
        </footer>
      </div>
    </div>
  );
}
