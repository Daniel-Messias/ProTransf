import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';
import {
  listarConvitesDoUsuario,
  responderConvite,
  souRespondente,
  TIPO_CLUBE_PARA_JOGADOR,
} from '../../../services/convitesService';
import { getClubeId } from '../../../utils/jogador';
import { toast } from '../../../utils/toast';
import Loader from '../../../components/Loader';
import styles from '../convites.module.css';

const ROTULO_STATUS = { aceito: 'Aceito', recusado: 'Recusado', pendente: 'Pendente' };

function formatarData(ts) {
  const data = ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null;
  return data ? data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '';
}

export default function Convites() {
  const { user, perfil, clube, ehPresidente } = useAuth();
  const clubePresidido = ehPresidente ? clube.id : null;

  const [convites, setConvites] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [respondendo, setRespondendo] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setConvites(await listarConvitesDoUsuario(user.uid, clubePresidido));
    } catch (e) {
      console.error('Erro ao carregar convites:', e);
      toast('Não foi possível carregar seus convites.', 'erro');
    } finally {
      setCarregando(false);
    }
  }, [user.uid, clubePresidido]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function responder(convite, aceitar) {
    const vaiTrocarDeClube =
      aceitar &&
      convite.tipo === TIPO_CLUBE_PARA_JOGADOR &&
      getClubeId(perfil) &&
      getClubeId(perfil) !== convite.clubeId;

    if (
      vaiTrocarDeClube &&
      !window.confirm(`Aceitar vai tirar você do clube atual e levar para ${convite.clubeNome}. Continuar?`)
    ) {
      return;
    }

    setRespondendo(convite.id);
    try {
      await responderConvite(convite, aceitar);
      toast(aceitar ? 'Transferência fechada! 🤝' : 'Convite recusado.', aceitar ? 'sucesso' : 'aviso');
      await carregar();
    } catch (e) {
      console.error('Erro ao responder convite:', e);
      toast('Erro ao responder o convite. Tente novamente.', 'erro');
    } finally {
      setRespondendo(null);
    }
  }

  if (carregando) return <Loader texto="Buscando seus convites..." />;

  const pendentes = convites.filter((c) => c.status === 'pendente');
  const recebidos = pendentes.filter((c) => souRespondente(c, user.uid, clubePresidido));
  const enviados = pendentes.filter((c) => !souRespondente(c, user.uid, clubePresidido));
  const historico = convites.filter((c) => c.status !== 'pendente');

  function descricao(c) {
    const jogador = c.jogadorUsername || c.jogadorNome || 'Jogador';
    const clubeNome = <Link to={`/clube/${c.clubeId}`}>{c.clubeNome || 'Clube'}</Link>;
    const jogadorLink = <Link to={`/jogador/${c.jogadorId}`}>{jogador}</Link>;

    if (c.tipo === TIPO_CLUBE_PARA_JOGADOR) {
      return c.jogadorId === user.uid ? (
        <>{clubeNome} quer você no elenco</>
      ) : (
        <>{clubeNome} convidou {jogadorLink}</>
      );
    }
    return c.jogadorId === user.uid ? (
      <>Você pediu para entrar no {clubeNome}</>
    ) : (
      <>{jogadorLink} quer entrar no {clubeNome}</>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.titulo}>Convites</h1>
        <p className={styles.subtitulo}>
          Propostas de clubes, pedidos de jogadores e o histórico das suas negociações.
        </p>
      </header>

      <section className={styles.secao}>
        <h2 className={styles.secaoTitulo}>
          Aguardando sua resposta
          {recebidos.length > 0 && <span className={styles.contador}>{recebidos.length}</span>}
        </h2>

        {recebidos.length === 0 ? (
          <p className={styles.vazio}>
            Nenhum convite pendente. <Link to="/transferencias">Ir ao mercado →</Link>
          </p>
        ) : (
          <ul className={styles.lista}>
            {recebidos.map((c) => (
              <li key={c.id} className={`${styles.item} ${styles.itemRecebido}`}>
                <div className={styles.info}>
                  <span className={styles.texto}>{descricao(c)}</span>
                  <span className={styles.meta}>
                    {c.posicao && `${c.posicao} · `}
                    {formatarData(c.criadoEm)}
                  </span>
                </div>
                <div className={styles.acoes}>
                  <button
                    type="button"
                    className={styles.btnAceitar}
                    disabled={respondendo === c.id}
                    onClick={() => responder(c, true)}
                  >
                    Aceitar
                  </button>
                  <button
                    type="button"
                    className={styles.btnRecusar}
                    disabled={respondendo === c.id}
                    onClick={() => responder(c, false)}
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {enviados.length > 0 && (
        <section className={styles.secao}>
          <h2 className={styles.secaoTitulo}>Enviados</h2>
          <ul className={styles.lista}>
            {enviados.map((c) => (
              <li key={c.id} className={styles.item}>
                <div className={styles.info}>
                  <span className={styles.texto}>{descricao(c)}</span>
                  <span className={styles.meta}>{formatarData(c.criadoEm)}</span>
                </div>
                <span className={`${styles.status} ${styles.pendente}`}>Aguardando</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {historico.length > 0 && (
        <section className={styles.secao}>
          <h2 className={styles.secaoTitulo}>Histórico</h2>
          <ul className={styles.lista}>
            {historico.map((c) => (
              <li key={c.id} className={styles.item}>
                <div className={styles.info}>
                  <span className={styles.texto}>{descricao(c)}</span>
                  <span className={styles.meta}>{formatarData(c.respondidoEm || c.criadoEm)}</span>
                </div>
                <span className={`${styles.status} ${styles[c.status] || ''}`}>
                  {ROTULO_STATUS[c.status] || c.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
