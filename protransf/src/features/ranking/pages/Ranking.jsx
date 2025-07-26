import React, { useEffect, useState } from 'react';

export default function Ranking() {
  const [countdown, setCountdown] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2025-10-01T20:00:00');

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setCountdown({
          dias: 0,
          horas: 0,
          minutos: 0,
          segundos: 0,
        });
        return;
      }

      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((diff / (1000 * 60)) % 60);
      const segundos = Math.floor((diff / 1000) % 60);

      setCountdown({ dias, horas, minutos, segundos });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

        @media (max-width: 480px) {
  .ranking-card {
    padding: 30px 20px;
    max-width: 90vw;
  }
  .ranking-title {
    font-size: 1.8rem;
  }
  .ranking-text {
    font-size: 1rem;
  }
  .countdown {
    gap: 10px;
  }
  .countdown-item {
    min-width: 50px;
    padding: 10px;
    font-size: 1rem;
  }
  .countdown-item span {
    font-size: 1.2rem;
  }
}

        .ranking-container {
          min-height: calc(100vh - 80px);
          background: url('/fundo-campo.jpg') no-repeat center center/cover;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .ranking-card {
          background-color: var(--surface);
          border-radius: 16px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.8s ease-in-out;
          max-width: 700px;
        }

        .ranking-title {
          font-size: 2.5rem;
          color: var(--primary);
          margin-bottom: 20px;
          text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
        }

        .ranking-text {
          font-size: 1.2rem;
          color: var(--text-muted);
          font-weight: 500;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .countdown {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }

        .countdown-item {
          background: var(--background);
          padding: 16px;
          border-radius: 12px;
          color: var(--primary);
          font-size: 1.2rem;
          min-width: 70px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .countdown-item span {
          display: block;
          font-size: 1.8rem;
          font-weight: bold;
          color: white;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="ranking-container">
        <div className="ranking-card">
          <h2 className="ranking-title">Página em breve!</h2>
          <p className="ranking-text">
           Em breve você conhecerá os jogadores mais votados da temporada.<br />
            Esta será a página oficial para eleger o <strong>"Melhor do Mundo do ProTransfer"</strong>!
          </p>

          <div className="countdown">
            <div className="countdown-item">
              <span>{countdown.dias}</span>dias
            </div>
            <div className="countdown-item">
              <span>{countdown.horas}</span>h
            </div>
            <div className="countdown-item">
              <span>{countdown.minutos}</span>min
            </div>
            <div className="countdown-item">
              <span>{countdown.segundos}</span>s
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
