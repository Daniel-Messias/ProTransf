// src/features/perfil/components/MainPerfil.jsx
import React from 'react';
import BlocoJogador from './BlocoJogador';
import BlocoClube from './BlocoClube';
import styles from '../styles/MainPerfil.module.css';

export default function MainPerfil({ jogador, clube }) {
  return (
    <main className={styles.main}>
      <BlocoJogador jogador={jogador} />
      <BlocoClube jogador={jogador} clube={clube} loading={false} />
    </main>
  );
}
