import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const transferencias = [
  {
    id: 1,
    title: 'ProGamer97 → FC Virtual',
    posicao: 'Volante',
    data: '05/06/2025',
    status: 'Contrato ativo',
  },
  {
    id: 2,
    title: 'SoccerKing11 → Atlético Digital',
    posicao: 'Atacante',
    data: '02/06/2025',
    status: 'Contrato ativo',
  },
  {
    id: 3,
    title: 'ElitePlayer22 → Real Virtual',
    posicao: 'Goleiro',
    data: '30/05/2025',
    status: 'Contrato ativo',
  },
  {
    id: 4,
    title: 'FastFoot → Clube Gamer',
    posicao: 'Lateral',
    data: '28/05/2025',
    status: 'Contrato ativo',
  },
];

const Transferencia = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const liveRegionRef = useRef(null);

 
  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % transferencias.length);
  };

  
  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? transferencias.length - 1 : prev - 1
    );
  };

  
  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Transferência atual: ${transferencias[currentIndex].title}`;
    }
  }, [currentIndex]);

  
  function pesquisar(event) {
    event.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      alert('Por favor, digite um nome de jogador ou clube para pesquisar.');
      return;
    }
    alert('Busca por: ' + query);
  }

  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      next();
    } else if (e.key === 'ArrowLeft') {
      prev();
    }
  };

  return (
    <>
      <style>{`
        :root {
          --primary: #5fbdf2;
          --background: #0d1b2a;
          --surface: #1b263b;
          --text: #ffffff;
          --text-muted: #cccccc;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', sans-serif;
          background-color: var(--background);
          color: var(--text);
          line-height: 1.6;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        header {
          background-color: #0a192f;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          flex-shrink: 0;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          cursor: default;
        }
        .logo span {
          color: var(--primary);
        }
        nav a {
          color: var(--text);
          text-decoration: none;
          margin: 0 15px;
          font-weight: 500;
          transition: color 0.2s;
        }
        nav a:hover {
          color: var(--primary);
        }
        nav a.active {
          color: var(--primary);
          font-weight: 700;
        }
        .btn-login {
          display: inline-block;
          padding: 10px 20px;
          background-color: transparent;
          border: 2px solid var(--primary);
          color: var(--primary);
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .btn-login:hover {
          background-color: var(--primary);
          color: #000;
        }
        main {
          flex-grow: 1;
          max-width: 1100px;
          margin: 40px auto;
          padding: 0 20px 60px;
          width: 100%;
        }
        h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 30px;
          color: var(--primary);
          text-align: center;
        }
        .search-bar {
          max-width: 500px;
          margin: 0 auto 40px auto;
          display: flex;
          gap: 10px;
        }
        .search-bar input[type="text"] {
          flex-grow: 1;
          padding: 12px 16px;
          border-radius: 8px;
          border: none;
          font-size: 1rem;
          outline: none;
        }
        .search-bar button {
          padding: 12px 20px;
          border: none;
          background-color: var(--primary);
          color: #000;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .search-bar button:hover {
          background-color: #3fa5e8;
        }
        .carousel-container {
          position: relative;
          max-width: 100%;
          margin-bottom: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .carousel-track {
          display: flex;
          gap: 20px;
          overflow: hidden;
          width: 320px;
          outline: none;
        }
        .card {
          background-color: var(--surface);
          min-width: 280px;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          flex-shrink: 0;
          transition: transform 0.3s ease;
          cursor: default;
          user-select: none;
        }
        .card[aria-hidden="true"] {
          display: none;
        }
        .card h3 {
          margin-bottom: 10px;
          color: var(--primary);
          font-weight: 700;
          font-size: 1.2rem;
        }
        .card p {
          font-size: 1rem;
          color: var(--text);
          margin-bottom: 6px;
        }
        .card small {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .section-title {
          color: var(--primary);
          font-weight: 700;
          font-size: 1.5rem;
          margin-bottom: 20px;
          border-bottom: 2px solid var(--primary);
          padding-bottom: 4px;
          max-width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }
        .jogadores-procurando {
          background-color: var(--surface);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 50px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .jogadores-procurando ul {
          list-style: none;
          padding-left: 0;
        }
        .jogadores-procurando li {
          padding: 12px 10px;
          border-bottom: 1px solid #2c3e50;
          font-size: 1rem;
          color: var(--text);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .jogadores-procurando li:last-child {
          border-bottom: none;
        }
        .horarios-clubes {
          background-color: var(--surface);
          border-radius: 12px;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto 50px auto;
        }
        .horarios-clubes ul {
          list-style: none;
          padding-left: 0;
        }
        .horarios-clubes li {
          padding: 10px 12px;
          border-bottom: 1px solid #2c3e50;
          font-size: 1rem;
          color: var(--text);
        }
        .horarios-clubes li:last-child {
          border-bottom: none;
        }
        footer {
          background-color: #0a192f;
          padding: 15px 40px;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          align-items: center;
          flex-shrink: 0;
        }
        footer a {
          color: var(--primary);
          font-size: 28px;
          transition: color 0.3s ease;
        }
        footer a:hover {
          color: #3fa5e8;
        }
        svg.icon {
          width: 28px;
          height: 28px;
          fill: currentColor;
          vertical-align: middle;
        }
        button.carousel-button {
          background-color: transparent;
          border: 2px solid var(--primary);
          color: var(--primary);
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.3s ease;
          user-select: none;
        }
        button.carousel-button:hover,
        button.carousel-button:focus {
          background-color: var(--primary);
          color: #000;
          outline: none;
        }
        button.carousel-button:disabled {
          border-color: #555;
          color: #555;
          cursor: not-allowed;
          background-color: transparent;
        }
        .carousel-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-left: 15px;
          margin-right: 15px;
        }
        @media (max-width: 600px) {
          header {
            flex-wrap: wrap;
            padding: 20px;
          }
          nav {
            width: 100%;
            margin-top: 10px;
            display: flex;
            justify-content: center;
          }
          nav a {
            margin: 0 10px;
          }
          .search-bar {
            flex-direction: column;
          }
          .search-bar button {
            width: 100%;
          }
          .carousel-container {
            flex-direction: column;
            gap: 20px;
          }
          .carousel-controls {
            flex-direction: row;
            margin: 10px auto 0 auto;
          }
        }
      `}</style>

      <header>
        <div className="logo">
          PRO<span>TRANSF</span>
        </div>
        <nav>
          <Link to="/">Início</Link>
          <Link to="/jogador">Jogadores</Link>
          <Link to="/clube">Clubes</Link>
          <Link to="/ranking">Ranking</Link>
        </nav>
        <Link to="/login" className="btn-login">
          Entrar
        </Link>
      </header>

      <main>
        <h1>Transferências Recentes</h1>

        <form className="search-bar" onSubmit={pesquisar}>
          <input
            type="text"
            id="searchInput"
            placeholder="Pesquisar jogador ou clube..."
            aria-label="Pesquisar jogador ou clube"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        <div
          className="carousel-container"
          role="region"
          aria-roledescription="carrossel"
          aria-label="Transferências recentes"
        >
          <div
            className="carousel-track"
            ref={carouselRef}
            tabIndex="0"
            onKeyDown={handleKeyDown}
            aria-live="polite"
            aria-atomic="true"
          >
            {transferencias.map((item, index) => (
              <article
                key={item.id}
                className="card"
                aria-hidden={index !== currentIndex}
                tabIndex={index === currentIndex ? 0 : -1}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${transferencias.length}`}
              >
                <h3>{item.title}</h3>
                <p>
                  <strong>Posição:</strong> {item.posicao}
                </p>
                <p>
                  <strong>Data:</strong> {item.data}
                </p>
                <small>{item.status}</small>
              </article>
            ))}
          </div>

          <div className="carousel-controls">
            <button
              onClick={prev}
              className="carousel-button"
              aria-label="Transferência anterior"
            >
              &lt; Anterior
            </button>
            <button
              onClick={next}
              className="carousel-button"
              aria-label="Próxima transferência"
            >
              Próximo &gt;
            </button>
          </div>
        </div>

        <section
          className="jogadores-procurando"
          aria-label="Jogadores procurando clube"
        >
          <h2 className="section-title">Jogadores Procurando Clube</h2>
          <ul>
            <li tabIndex="0">
              ProPlayerX <span>Volante</span>
            </li>
            <li tabIndex="0">
              SpeedyStriker <span>Atacante</span>
            </li>
            <li tabIndex="0">
              SafeHands <span>Goleiro</span>
            </li>
            <li tabIndex="0">
              WingWizard <span>Lateral</span>
            </li>
          </ul>
        </section>

        <section
          className="horarios-clubes"
          aria-label="Horários em que os clubes mais jogam"
        >
          <h2 className="section-title">Horários em que os Clubes Mais Jogam</h2>
          <ul id="horariosClubesLista">
            <li tabIndex="0">Segunda-feira: 19h - 22h</li>
            <li tabIndex="0">Quarta-feira: 20h - 23h</li>
            <li tabIndex="0">Sábado: 14h - 18h</li>
            <li tabIndex="0">Domingo: 10h - 13h</li>
          </ul>
        </section>
      </main>

      <footer>
        <a
          href="https://www.instagram.com/protransf/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram PROTRANSF"
        >
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm7-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
        </a>
        <a
          href="https://www.facebook.com/protransf"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook PROTRANSF"
        >
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M13 2h3v4h-3v2h3v4h-3v8h-3v-8H7v-4h3V6a3 3 0 0 1 3-3z" />
          </svg>
        </a>
        <a
          href="https://twitter.com/protransf"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter PROTRANSF"
        >
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M22 5.92c-.77.34-1.6.57-2.46.68a4.33 4.33 0 0 0 1.89-2.38 8.58 8.58 0 0 1-2.74 1.05 4.29 4.29 0 0 0-7.3 3.91A12.16 12.16 0 0 1 3.16 4.7a4.28 4.28 0 0 0 1.33 5.72 4.27 4.27 0 0 1-1.94-.54v.05a4.29 4.29 0 0 0 3.44 4.2 4.3 4.3 0 0 1-1.93.07 4.29 4.29 0 0 0 4 3 8.6 8.6 0 0 1-5.3 1.82A8.65 8.65 0 0 1 2 18.17a12.14 12.14 0 0 0 6.57 1.93c7.88 0 12.2-6.54 12.2-12.2 0-.19 0-.38-.01-.57A8.72 8.72 0 0 0 22 5.92z" />
          </svg>
        </a>
      </footer>

      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          border: 0,
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(100%)',
        }}
      />
    </>
  );
};

export default Transferencia;
