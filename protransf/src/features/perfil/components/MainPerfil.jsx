// src/features/perfil/components/MainPerfil.jsx
import React from 'react';
import BlocoJogador from './BlocoJogador';
import BlocoClube from './BlocoClube';
import styles from '../styles/MainPerfil.module.css';

export default function MainPerfil({ jogador, clube, modoLeitura }) {
  return (
    <main className={styles.main}>
      <BlocoJogador jogador={jogador} modoLeitura={modoLeitura} />
      <BlocoClube jogador={jogador} clube={clube} modoLeitura={modoLeitura} loading={false} />
    </main>
  );
}
