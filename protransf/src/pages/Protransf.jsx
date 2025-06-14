import React from "react";
import bola from "../assets/fotos/bola.png";

export default function Home() {
  
  const jogadores = [
  { nome: "ProGamer97", posicao: "Volante", status: "Livre", plataforma: "Xbox", foto: "https://randomuser.me/api/portraits/men/1.jpg" },
  { nome: "SoccerKing11", posicao: "Atacante", status: "Contrato ativo", plataforma: "PlayStation", foto: "https://randomuser.me/api/portraits/men/2.jpg" },
  { nome: "ElitePlayer22", posicao: "Goleiro", status: "Aberto a propostas", plataforma: "PC", foto: "https://randomuser.me/api/portraits/men/3.jpg" },
  { nome: "SkillMaster09", posicao: "Meia", status: "Livre", plataforma: "Xbox", foto: "https://randomuser.me/api/portraits/men/4.jpg" },
];

  return (
    <>
      <div className="hero">
        <h1 className="centro">
          PR
          <img src={bola} alt="bola de futebol" className="soccer-ball" />
          <span>TRANSFER</span>
        </h1>
        <h2>MERCADO DE TRANSFERÊNCIAS</h2>
        <p>Buscando um novo clube ou reforços? No PROTRANSF você encontra as melhores oportunidades.</p>
        <div className="buttons">
          <button className="btn-primary">VER JOGADORES</button>
          <a href="/cadastro" className="btn-secondary">CADASTRAR-SE</a>
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
  {jogadores.map((jogador, index) => (
    <tr key={index}>
      <td>
        <img 
          src={jogador.foto} 
          alt={`Foto de ${jogador.nome}`} 
          style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} 
        />
      </td>
      <td>{jogador.nome}</td>
      <td>
  <span
    className={`posicao ${["Goleiro", "Zagueiro", "Lateral", "Volante"].includes(jogador.posicao) ? "defense" : "attack"}`}
  >
    {jogador.posicao}
  </span>
</td>

      <td>{jogador.status}</td>
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
    { nome: "E-Squad", pontos: 60 }
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
          <button type="submit" className="btn-primary">Enviar</button>
        </form>
      </section>
    </>
  );
}
