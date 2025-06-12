import React from 'react';
import './ranking.css';

const RankingPage = () => {
  return (
    <div className="ranking-container">
      
      <RankingSection title="⚽ Top 5 - Goleadores" items={[
        { nome: "Jucie Carlos", valor: "27 gols" },
        { nome: "Daniel Messias", valor: "24 gols" },
        { nome: "Rabico Delas", valor: "22 gols" },
        { nome: "Paulinho dk", valor: "21 gols" },
        { nome: "Lilian BR", valor: "20 gols" },
      ]} />

      <RankingSection title="🎯 Top 5 - Assistências" items={[
        { nome: "Jucie Carlos", valor: "19 assistências" },
        { nome: "Daniel Messias", valor: "18 assistências" },
        { nome: "Rabico Delas", valor: "17 assistências" },
        { nome: "Paulinho dk", valor: "16 assistências" },
        { nome: "Lilian BR", valor: "15 assistências" },
      ]} />

      <RankingSection title="📊 Top 5 - Notas Mais Altas" items={[
        { nome: "Jucie Carlos", valor: "9.6" },
        { nome: "Daniel Messias", valor: "9.4" },
        { nome: "Rabico Delas", valor: "9.3" },
        { nome: "Paulinho dk", valor: "9.2" },
        { nome: "Lilian BR", valor: "9.1" },
      ]} />

      <RankingSection title="🏟️ Top 5 - Clubes por Títulos" items={[
        { nome: "The Horse FC", valor: "15 títulos", dono: "Jucie Carlos" },
        { nome: "Palmeiras EC", valor: "13 títulos", dono: "Rodrigo Ferreira" },
        { nome: "Atlético Mineiro", valor: "11 títulos", dono: "Mariana Souza" },
        { nome: "Grêmio RS", valor: "9 títulos", dono: "Lucas Mendes" },
        { nome: "Fortaleza SC", valor: "7 títulos", dono: "Fernanda Lima" },
      ]} isClubes />

      <div className="voltar">
        <a href="/">
          <button>⬅️ Início</button>
        </a>
      </div>
    </div>
  );
};

const RankingSection = ({ title, items, isClubes = false }) => (
  <section>
    <h2>{title}</h2>
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          <div>
            <strong style={{ color: '#00b4d8' }}>{item.nome}</strong> — <span style={{ color: '#ffd60a' }}>{item.valor}</span>
          </div>
          {isClubes && <div style={{ fontSize: '0.9em', color: '#adb5bd' }}>Dono: {item.dono}</div>}
        </li>
      ))}
    </ul>
  </section>
);

export default RankingPage;
