// src/features/perfil/components/MainPerfil.jsx
import React from 'react';
import BlocoJogador from './BlocoJogador';
import BlocoClube from './BlocoClube';
import styles from '../styles/MainPerfil.module.css';

export default function MainPerfil({ jogador, clube, modoLeitura, usuarioLogado, carregandoClube }) {
  return (
    <main className={styles.main}>
      <BlocoJogador jogadorId={jogador?.id} modoLeitura={modoLeitura} />
      <BlocoClube
        clube={clube}
        modoLeitura={modoLeitura}
        usuarioLogado={usuarioLogado}
        carregando={carregandoClube}
      />
    </main>
  );
}
