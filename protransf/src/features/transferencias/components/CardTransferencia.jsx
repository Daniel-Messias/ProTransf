import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CardTransferencia.module.css';
import OverallBadge from '../../../components/OverallBadge';
import { useAuth } from '../../../services/AuthContext';
import {
  enviarConvite,
  TIPO_CLUBE_PARA_JOGADOR,
  TIPO_JOGADOR_PARA_CLUBE,
} from '../../../services/convitesService';
import {
  clubeBuscandoJogadores,
  ehJogador,
  getCamisa,
  getClubeId,
  getFoto,
  getNomeExibicao,
  getPosicao,
} from '../../../utils/jogador';
import { toast } from '../../../utils/toast';

/**
 * Card do mercado. `tipo` = "jogador" | "clube".
 */
export default function CardTransferencia({ dados, tipo }) {
  const { user, perfil, clube: meuClube, ehPresidente } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const isJogador = tipo === 'jogador';

  // Presidente convida jogador · jogador pede para entrar em clube
  const acao = (() => {
    if (!user) return null;
    if (isJogador) {
      if (!ehPresidente || dados.id === user.uid) return null;
      if (getClubeId(dados) === meuClube.id) return null;
      return { label: `Convidar para ${meuClube.nome}`, tipo: TIPO_CLUBE_PARA_JOGADOR };
    }
    if (!ehJogador(perfil) || getClubeId(perfil) === dados.id) return null;
    return { label: 'Pedir para entrar', tipo: TIPO_JOGADOR_PARA_CLUBE };
  })();

  async function handleConvite() {
    if (enviando || !acao) return;
    setEnviando(true);
    try {
      await enviarConvite(
        isJogador
          ? { tipo: acao.tipo, jogador: dados, clube: meuClube }
          : { tipo: acao.tipo, jogador: perfil, clube: dados }
      );
      setEnviado(true);
      toast(isJogador ? 'Convite enviado!' : 'Pedido enviado ao clube!');
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast(error.message || 'Erro ao enviar convite. Tente novamente.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  const rodape = (
    <div className={styles.rodape}>
      <Link
        to={isJogador ? `/jogador/${dados.id}` : `/clube/${dados.id}`}
        className={styles.link}
      >
        Ver perfil →
      </Link>

      {acao && (
        <button
          className={styles.btn}
          onClick={handleConvite}
          type="button"
          disabled={enviando || enviado}
        >
          {enviado ? 'Enviado ✓' : enviando ? 'Enviando...' : acao.label}
        </button>
      )}

      {!user && (
        <Link to="/login" className={styles.btnGhost}>
          Entre para negociar
        </Link>
      )}
    </div>
  );

  if (isJogador) {
    const foto = getFoto(dados);
    const nome = getNomeExibicao(dados);
    const camisa = getCamisa(dados);

    return (
      <article className={styles.card}>
        <div className={styles.cabecalho}>
          <div className={styles.avatar}>
            {foto ? <img src={foto} alt="" /> : nome.charAt(0)}
          </div>
          <div className={styles.identidade}>
            <h4 className={styles.nome}>{nome}</h4>
            <p className={styles.username}>@{dados.username || 'usuario'}</p>
          </div>
          <OverallBadge jogador={dados} size="sm" />
        </div>

        <div className={styles.tags}>
          <span className={styles.tagDestaque}>{getPosicao(dados) || 'Sem posição'}</span>
          {dados.posicaoSecundaria && <span className={styles.tag}>{dados.posicaoSecundaria}</span>}
          {dados.plataforma && <span className={styles.tag}>🎮 {dados.plataforma}</span>}
          {camisa && <span className={styles.tag}>#{camisa}</span>}
        </div>

        {dados.bio && <p className={styles.bio}>{dados.bio}</p>}

        {rodape}
      </article>
    );
  }

  const buscando = clubeBuscandoJogadores(dados);

  return (
    <article className={`${styles.card} ${styles.cardClube}`}>
      <div className={styles.cabecalho}>
        <div className={`${styles.avatar} ${styles.escudo}`}>
          {(dados.nome || 'C').charAt(0)}
        </div>
        <div className={styles.identidade}>
          <h4 className={styles.nome}>
            {dados.nome || 'Clube'}
            {dados.verificado && <span className={styles.verificado} title="Clube verificado">✔</span>}
          </h4>
          <p className={styles.username}>@{dados.username || 'clube'}</p>
        </div>
      </div>

      <div className={styles.tags}>
        <span className={buscando ? styles.tagDestaque : styles.tag}>
          {buscando ? '🔎 Buscando jogadores' : 'Mercado fechado'}
        </span>
        {dados.plataforma && <span className={styles.tag}>🎮 {dados.plataforma}</span>}
      </div>

      {dados.bio && <p className={styles.bio}>{dados.bio}</p>}

      {rodape}
    </article>
  );
}
