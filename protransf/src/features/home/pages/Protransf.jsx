import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import bola from "../../../assets/fotos/bola.png";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../services/firebase";
import { buscarJogadores } from "../../../services/firestoreService";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, "usuarios", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTipo(docSnap.data().tipo || null);
          } else {
            setTipo(null);
          }
        } catch (error) {
          console.error("Erro ao buscar tipo do usuário:", error);
          setTipo(null);
        }
      } else {
        setTipo(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function carregarJogadores() {
      setLoading(true);
      try {
        const jogadoresReais = await buscarJogadores();
        setJogadores(jogadoresReais);
      } catch (error) {
        console.error("Erro ao buscar jogadores:", error);
      }
      setLoading(false);
    }

    carregarJogadores();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Carregando jogadores...</p>;
  }

  return (
    <>
      <div className="hero">
        <h1 className="centro">
          PR
          <img src={bola} alt="bola de futebol" className="soccer-ball" />
          <span>TRANSFER</span>
        </h1>
        <h2>MERCADO DE TRANSFERÊNCIAS</h2>
        <p>
          Buscando um novo clube ou reforços? No PROTRANSF você encontra as
          melhores oportunidades.
        </p>
        <div className="buttons">
          {!user ? (
            <Link to="/cadastro" className="btn-cadastrar">
              CADASTRAR-SE
            </Link>
          ) : tipo === "clube" || tipo === "clube_jogador" ? (
            <Link to="/clube" className="btn-ver-perfil">
              PERFIL
            </Link>
          ) : (
            <Link to="/jogador" className="btn-ver-perfil">
              PERFIL
            </Link>
          )}
        </div>
      </div>

      <section>
        <h3>JOGADORES EM DESTAQUE</h3>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Jogador</th>
              <th>Posição</th>
              <th>Status</th>
              <th>Plataforma</th>
            </tr>
          </thead>
          <tbody>
            {jogadores.slice(0, 5).map((jogador) => (
              <tr
                key={jogador.id}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  (window.location.href = `/perfil-jogador/${jogador.id}`)
                }
              >
                <td>
                  <img
                    src={jogador.fotoURL || "https://via.placeholder.com/50"}
                    alt={`Foto de ${jogador.nome}`}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{jogador.nome}</td>
                <td>
                  <span
                    className={`posicao ${
                      ["Goleiro", "Zagueiro", "Lateral Direito", "Lateral Esquerdo", "Volante"].includes(
                        jogador.posicao
                      )
                        ? "defense"
                        : "attack"
                    }`}
                  >
                    {jogador.posicao}
                  </span>
                </td>
                <td>{jogador.status || "-"}</td>
                <td>{jogador.plataforma}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="table-container">
        <div className="columns">
          <div className="column">
            <h3>RANKING DE CLUBES</h3>
            <ul className="ranking-list">
              {[
                { nome: "FC Virtual", pontos: 72 },
                { nome: "Eleven United", pontos: 68 },
                { nome: "VPG Stars", pontos: 65 },
                { nome: "E-Squad", pontos: 60 },
              ].map((clube, i) => (
                <li key={i}>
                  <span className="pos">{i + 1}</span>
                  <span className="team-name">{clube.nome}</span>
                  <span className="pontos">{clube.pontos} pts</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="column">
            <h3>ÚLTIMAS TRANSFERÊNCIAS</h3>
            <ul className="transfer-list">
              {[
                { de: "RapidShot55", para: "Cyber FC" },
                { de: "Playmaker08", para: "Final Josoada" },
                { de: "SolidDefender", para: "Dreamerz" },
              ].map((t, i) => (
                <li key={i} className="transfer-item">
                  <span className="from">{t.de}</span>
                  <span className="arrow">→</span>
                  <span className="to">{t.para}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="contact">
        <h3>Entre em contato conosco</h3>
        <form>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Seu e-mail"
              required
            />
          </div>
          <div className="form-group full-width">
            <label htmlFor="mensagem">Mensagem</label>
            <textarea
              id="mensagem"
              name="mensagem"
              rows="3"
              placeholder="Escreva sua mensagem..."
              required
            ></textarea>
          </div>
          <button type="submit" className="btn-primary">
            Enviar
          </button>
        </form>
      </section>
    </>
  );
}
