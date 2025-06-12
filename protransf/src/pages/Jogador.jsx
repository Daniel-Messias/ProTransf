import React from 'react';
import styles from './Jogador.module.css';

export default function Jogador() {
  return (
    <section className={styles.perfilJogador}>
      <div className={styles.perfilTopo}>
        <img
          src="fotos/jogador.jpg"
          alt="Foto do Jogador"
          className={styles.fotoJogador}
        />
        <div className={styles.infoJogador}>
          <h1>TheAlpha1005</h1>
          <p><strong>Posição:</strong> Volante</p>
          <p><strong>Plataforma:</strong> Xbox</p>
          <p>
            <strong>Status:</strong> <span className={`${styles.status} ${styles.livre}`}>Livre no mercado</span>
          </p>
        </div>
      </div>

      <div className={styles.descricaoJogador}>
        <h2>Sobre o Jogador</h2>
        <p>
          Jogador essencial para o equilíbrio do time, o primeiro volante é a primeira linha de defesa e o motor do meio-campo. Com ótima capacidade de marcação, leitura de jogo e passes precisos, ele protege a defesa, recupera a posse de bola e inicia as jogadas ofensivas com inteligência e controle. Um verdadeiro líder em campo, capaz de ditar o ritmo do jogo e conectar defesa e ataque com eficiência.
        </p>
      </div>

      <div className={styles.clubeAtual}>
        <h2>Clube Atual</h2>
        <p>Atualmente sem clube — disponível para propostas!</p>
      </div>

      <div className={styles.videosDestaque}>
        <h2>Melhores Jogadas</h2>
        <div className={styles.videoGrid}>
          <iframe
            width="360"
            height="200"
            src="https://www.youtube.com/embed/VIDEO_ID1"
            title="Video 1"
            frameBorder="0"
            allowFullScreen
          ></iframe>
          <iframe
            width="360"
            height="200"
            src="https://www.youtube.com/embed/VIDEO_ID2"
            title="Video 2"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div className={styles.contatoJogador}>
        <h2>Entre em contato com o jogador</h2>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">+55 11 99999-9999 📱</a></p>
        <p><strong>Instagram:</strong> <a href="https://instagram.com/usuariojogador" target="_blank" rel="noopener noreferrer">@usuariojogador 📸</a></p>
      </div>
    </section>
  );
}
