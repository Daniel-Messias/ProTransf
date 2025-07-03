import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bola from "../../../assets/fotos/bola.png";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../services/firebase";
import { buscarJogadores } from "../../../services/firestoreService";
import { doc, getDoc, collection, limit, query, orderBy, getDocs } from "firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { FaUser } from "react-icons/fa";
import UltimasTransferencias from "../components/UltimasTransferencias";


export default function Home() {
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [jogadores, setJogadores] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formEnviado, setFormEnviado] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, "usuarios", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          setTipo(docSnap.exists() ? docSnap.data().tipo : null);
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
  async function carregarClubes() {
    try {
      const q = query(collection(db, "clubes"), limit(4));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc, i) => ({
        id: doc.id,
        ...doc.data(),
        pontos: 70 - i * 4 // pontos fictícios decrescentes
      }));
      setClubes(lista);
    } catch (error) {
      console.error("Erro ao buscar clubes:", error);
    }
  }

  carregarClubes();
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

 const handleSubmit = async (e) => {
  e.preventDefault();
  const nome = e.target.nome.value;
  const email = e.target.email.value;
  const mensagem = e.target.mensagem.value;

  try {
    await addDoc(collection(db, "mensagensContato"), {
      nome,
      email,
      mensagem,
      enviadoEm: serverTimestamp(),
    });

    setFormEnviado(true);
    e.target.reset(); // limpa o formulário após envio
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    alert("Erro ao enviar. Tente novamente.");
  }
};
  if (loading) return <p style={{ textAlign: "center" }}>Carregando jogadores...</p>;

  return (
    <>
      <div className="hero">
        <h1 className="centro">
          PR<img src={bola} alt="bola de futebol" className="soccer-ball" />
          <span>TRANSFER</span>
        </h1>
        <h2>MERCADO DE TRANSFERÊNCIAS</h2>
        <p>
          Buscando um novo clube ou reforços? No PROTRANSFER você encontra as melhores oportunidades.
        </p>
        <div className="buttons">
  {!user ? (
    <Link to="/cadastro" className="btn-cadastrar">
      CADASTRAR-SE
    </Link>
  ) : (
    <Link to="/perfil" className="btn-ver-perfil">
      <FaUser style={{ marginRight: 6 }} />
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
                onClick={() => navigate(`/perfil/${jogador.id}`)}
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
              {clubes.map((clube, i) => (
                <li
                key={clube.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/perfil/${clube.id}`)}>
                  <span className="pos">{i + 1}</span>
                  <span className="team-name">{clube.nome}</span>
                  <span className="pontos">{clube.pontos} pts</span>
                  </li>
                ))}
            </ul>

          </div>

          <div className="column">
            <div className="column">
              <h3>ÚLTIMAS TRANSFERÊNCIAS</h3>
              <UltimasTransferencias />
              </div>
          </div>
        </div>
      </div>

      <section className="contact">
        <h3>Entre em contato conosco</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input type="text" id="nome" name="nome" placeholder="Seu nome completo" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" placeholder="Seu e-mail" required />
          </div>
          <div className="form-group full-width">
            <label htmlFor="mensagem">Mensagem</label>
            <textarea id="mensagem" name="mensagem" rows="3" placeholder="Escreva sua mensagem..." required></textarea>
          </div>
          <button type="submit" className="btn-primary">
            Enviar
          </button>
          {formEnviado && <p className="msg-sucesso">Mensagem enviada com sucesso!</p>}
        </form>
      </section>
    </>
  );
}
