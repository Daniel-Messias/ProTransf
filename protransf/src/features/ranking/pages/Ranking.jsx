import React from 'react';

export default function Ranking() {
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
        .ranking-info {
          max-width: 800px;
          margin: 80px auto 150px auto;
          padding: 100px;
          background-color: var(--surface);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          color: var(--text);
          text-align: center;
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
        }
        .ranking-info h2 {
          font-size: 2.4rem;
          margin-bottom: 20px;
          font-weight: 700;
          color: var(--primary);
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
        }
        .ranking-info p {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-muted);
        }
      `}</style>

      <section className="ranking-info">
        <h2>Página em breve!</h2>
        <p>
          Aqui teremos tudo sobre o ranking dos melhores jogadores.<br />
          Será por essa página que faremos a votação do <strong>"Melhor do Mundo"</strong>!
        </p>
      </section>
    </>
  );
}
