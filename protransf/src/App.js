import './style.css';
import bola from './assets/fotos/bola.png';


function App() {
  return (
    <>
      <header>
        <div className="logo">PRO<span>TRANSF</span></div>
        <nav>
          <a href="transferencia.html">Transferências</a>
          <a href="jogador.html">Jogador</a>
          <a href="clube.html">Clubes</a>
          <a href="ranking.html">Ranking</a>
        </nav>
        <a href="login.html" className="btn-login">Entrar</a>
      </header>

      <div className="hero">
        <h1 className="centro">
          PR<img src={bola} alt="bola de futebol" className="soccer-ball" /><span>TRANSF</span>
        </h1>
        <h2>MERCADO DE TRANSFERÊNCIAS</h2>
        <p>Buscando um novo clube ou reforços? No PROTRANSF você encontra as melhores oportunidades.</p>
        <div className="buttons">
          <button className="btn-primary">VER JOGADORES</button>
          <a href="cadastro.html" className="btn-secondary">CADASTRAR-SE</a>
        </div>
      </div>

      <section>
        <h3>JOGADORES EM DESTAQUE</h3>
        <table>
          <thead>
            <tr>
              <th>Jogador</th>
              <th>Posição</th>
              <th>Status</th>
              <th>Plataforma</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>ProGamer97</td><td>Volante</td><td>Livre</td><td>Xbox</td></tr>
            <tr><td>SoccerKing11</td><td>Atacante</td><td>Contrato ativo</td><td>PlayStation</td></tr>
            <tr><td>ElitePlayer22</td><td>Goleiro</td><td>Aberto a propostas</td><td>PC</td></tr>
            <tr><td>SkillMaster09</td><td>Meia</td><td>Livre</td><td>Xbox</td></tr>
          </tbody>
        </table>
      </section>

      <section className="columns">
        <div className="column">
          <h3>RANKING DE CLUBES</h3>
          <table>
            <tbody>
              <tr><td>1</td><td>FC Virtual</td></tr>
              <tr><td>2</td><td>Eleven United</td></tr>
              <tr><td>3</td><td>VPG Stars</td></tr>
              <tr><td>4</td><td>E-Squad</td></tr>
            </tbody>
          </table>
        </div>
        <div className="column">
          <h3>ÚLTIMAS TRANSFERÊNCIAS</h3>
          <table>
            <tbody>
              <tr><td>RapidShot55 → Cyber FC</td></tr>
              <tr><td>Playmaker08 → Final josoada</td></tr>
              <tr><td>SolidDefender → Dreamerz</td></tr>
            </tbody>
          </table>
        </div>
      </section>

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
            <textarea id="mensagem" name="mensagem" rows="4" placeholder="Escreva sua mensagem..." required></textarea>
          </div>
          <button type="submit" className="btn-primary">Enviar</button>
        </form>
      </section>
    </>
  );
}

export default App;
