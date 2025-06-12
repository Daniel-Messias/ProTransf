import React, { useState } from "react";
import styles from "./transferencia.module.css";

const Transferencias = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const jogadores = [
    { nome: "Lucas Silva", posicao: "Atacante" },
    { nome: "João Pedro", posicao: "Meio-campo" },
    { nome: "Carlos Souza", posicao: "Zagueiro" },
  ];

  const horarios = [
    { clube: "Clube A", horario: "14:00" },
    { clube: "Clube B", horario: "16:30" },
    { clube: "Clube C", horario: "18:00" },
  ];

  const cards = [
    "Notícia 1: Novo jogador no mercado!",
    "Destaque: Clube X busca reforços",
    "Última hora: Transferência surpresa",
    "Negociação entre Clube Y e Z",
    "Atualização: Jogador retorna ao Brasil",
  ];

  const filteredJogadores = jogadores.filter((jogador) =>
    jogador.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* header removido */}

      <main className={styles.main}>
        <h1 className={styles.h1}>Transferências Recentes</h1>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar jogador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>Buscar</button>
        </div>

        <div className={styles.carouselContainer}>
          <div className={styles.carouselTrack}>
            {cards.map((card, index) => (
              <div key={index} className={styles.card}>
                <p className={styles.cardTitle}>{card}</p>
              </div>
            ))}
          </div>
        </div>

        <section className={styles.jogadoresProcurando}>
          <h2 className={styles.sectionTitle}>Jogadores Procurando Clube</h2>
          {filteredJogadores.map((jogador, index) => (
            <div key={index} className={styles.jogadorItem}>
              {jogador.nome}
              <span className={styles.jogadorPosicao}>- {jogador.posicao}</span>
            </div>
          ))}
        </section>

        <section className={styles.horariosClubes}>
          <h2 className={styles.sectionTitle}>Horários que os Clubes Jogam</h2>
          {horarios.map((item, index) => (
            <div key={index} className={styles.horarioItem}>
              {item.clube} - {item.horario}
            </div>
          ))}
        </section>
      </main>

      <footer className={styles.footer}>
        <a href="/" className={styles.footerLink}>Política de Privacidade</a>
        <a href="/" className={styles.footerLink}>Termos de Uso</a>
      </footer>
    </div>
  );
};

export default Transferencias;
