import React from 'react';
import styles from '../Jogador.module.css';

export default function PerfilJogadorPage() {
  return (
    <section className={styles.perfilJogador}>
      <div className={styles.perfilTopo}>
        <img
          src="fotos/jogador.jpg"
          alt="Foto do Jogador"
          className={styles.fotoJogador}
        />
        <div className={styles.infoJogador}>
          <h1>TheAlpha1005 <span className={styles.nickname}>(@Alpha)</span></h1>
          <p><strong>Posição Primária:</strong> Volante</p>
          <p><strong>Posição Secundária:</strong> Meia</p>
          <p><strong>Plataforma:</strong> Xbox</p>
          <p>
            <strong>Status:</strong> <span className={`${styles.status} ${styles.livre}`}>Livre no mercado</span>
          </p>
          <button className={styles.btnEditar}>Editar Perfil</button>
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
    <div className={styles.videoWrapper}>
      <iframe
        src="https://www.youtube.com/embed/VIDEO_ID1"
        title="Video 1"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
    <div className={styles.videoWrapper}>
      <iframe
        src="https://www.youtube.com/embed/VIDEO_ID2"
        title="Video 2"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  </div>
</div>

      <div className={styles.contatoJogador}>
        <h2>Entre em contato com o jogador</h2>
        <p>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="WhatsApp"
          >
            {/* Ícone WhatsApp SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#25D366" viewBox="0 0 24 24">
              <path d="M20.52 3.48a11.9 11.9 0 00-16.83 16.83l-1.95 5.77 5.93-1.95a11.9 11.9 0 0012.85-20.65zm-4.75 13.54c-.28.78-1.59 1.49-2.2 1.59-.59.1-1.3.14-3.02-.92-2.49-1.44-4.12-4.19-4.25-4.39-.13-.2-1.1-1.6-1.1-3.06 0-1.45.97-2.15 1.31-2.44.34-.28.74-.28 1-.28.26 0 .5 0 .72.01.23.01.35.03.5.33.14.3.47 1 .51 1.07.04.07.06.14.02.22-.04.07-.07.15-.11.22-.04.07-.09.18-.13.26-.04.07-.08.13-.02.2.07.07 1.22 1.85 2.94 2.52 1.28.54 1.8.7 2.19 1.12.41.44.38.9.27.99z"/>
            </svg>
          </a>
          &nbsp;&nbsp;
          <a
            href="https://instagram.com/usuariojogador"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="Instagram"
          >
            {/* Ícone Instagram SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#E4405F" viewBox="0 0 24 24">
              <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm8.25 2.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"/>
            </svg>
          </a>
        </p>
      </div>
    </section>
  );
}
