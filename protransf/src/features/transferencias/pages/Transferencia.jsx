import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { buscarClubes, buscarUsuarios } from '../../../services/firestoreService';
import { useAuth } from '../../../services/AuthContext';
import {
  clubeBuscandoJogadores,
  ehJogador,
  getPosicao,
  idsComClube,
  PLATAFORMAS,
  POSICOES,
} from '../../../utils/jogador';
import styles from '../transferencia.module.css';
import CardTransferencia from '../components/CardTransferencia';
import Loader from '../../../components/Loader';

const ABAS_FEED = [
  { id: 'aceito', label: '✅ Fechadas' },
  { id: 'pendente', label: '⏳ Negociando' },
  { id: 'recusado', label: '❌ Melou' },
];

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export default function Transferencia() {
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [aba, setAba] = useState('jogadores');
  const [busca, setBusca] = useState('');
  const [posicao, setPosicao] = useState('');
  const [plataforma, setPlataforma] = useState('');

  const [convites, setConvites] = useState([]);
  const [abaFeed, setAbaFeed] = useState('aceito');

  useEffect(() => {
    Promise.all([buscarUsuarios(), buscarClubes()])
      .then(([u, c]) => {
        setUsuarios(u);
        setClubes(c);
      })
      .catch((e) => console.error('Erro ao carregar mercado:', e))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'convites'), orderBy('criadoEm', 'desc'), limit(60));
    return onSnapshot(
      q,
      (snap) => setConvites(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Erro ao carregar transferências:', err)
    );
  }, []);

  const resultados = useMemo(() => {
    const termo = normalizar(busca);
    const bate = (item) =>
      !termo || normalizar(`${item.nome} ${item.username}`).includes(termo);
    const plataformaOk = (item) => !plataforma || item.plataforma === plataforma;

    if (aba === 'jogadores') {
      const ocupados = idsComClube(clubes, usuarios);
      return usuarios
        .filter((u) => ehJogador(u) && !ocupados.has(u.id) && u.id !== user?.uid)
        .filter((u) => !posicao || getPosicao(u) === posicao)
        .filter(plataformaOk)
        .filter(bate);
    }
    return clubes.filter(clubeBuscandoJogadores).filter(plataformaOk).filter(bate);
  }, [aba, usuarios, clubes, busca, posicao, plataforma, user]);

  const feed = convites.filter((c) => c.status === abaFeed).slice(0, 12);
  const clubesExistentes = new Set(clubes.map((c) => c.id));

  return (
    <main className={styles.container}>
      {/* ================= HERO ================= */}
      <section className={styles.hero}>
        <span className={styles.badge}>Janela aberta</span>
        <h1 className={styles.titulo}>
          Mercado de <span>Transferências</span>
        </h1>
        <p className={styles.subtitulo}>
          Encontre jogadores livres ou clubes procurando reforços. Convites e pedidos
          ficam em <Link to="/convites">Convites</Link>.
        </p>
      </section>

      {/* ================= FILTROS ================= */}
      <section className={styles.painel}>
        <div className={styles.segmentado} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'jogadores'}
            className={aba === 'jogadores' ? styles.segAtivo : ''}
            onClick={() => setAba('jogadores')}
          >
            Jogadores livres
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'clubes'}
            className={aba === 'clubes' ? styles.segAtivo : ''}
            onClick={() => setAba('clubes')}
          >
            Clubes buscando
          </button>
        </div>

        <div className={styles.filtros}>
          <input
            type="search"
            placeholder={aba === 'jogadores' ? 'Buscar jogador...' : 'Buscar clube...'}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.campoBusca}
          />

          {aba === 'jogadores' && (
            <select value={posicao} onChange={(e) => setPosicao(e.target.value)}>
              <option value="">Todas as posições</option>
              {POSICOES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}

          <select value={plataforma} onChange={(e) => setPlataforma(e.target.value)}>
            <option value="">Todas as plataformas</option>
            {PLATAFORMAS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ================= RESULTADOS ================= */}
      {carregando ? (
        <Loader texto="Abrindo o mercado..." />
      ) : resultados.length === 0 ? (
        <p className={styles.msgVazio}>
          Nenhum {aba === 'jogadores' ? 'jogador livre' : 'clube buscando jogadores'} com esses filtros.
        </p>
      ) : (
        <>
          <p className={styles.contagem}>
            {resultados.length} {aba === 'jogadores' ? 'jogador(es)' : 'clube(s)'} encontrado(s)
          </p>
          <div className={styles.grid}>
            {resultados.map((item) => (
              <CardTransferencia
                key={item.id}
                dados={item}
                tipo={aba === 'jogadores' ? 'jogador' : 'clube'}
              />
            ))}
          </div>
        </>
      )}

      {/* ================= FEED ================= */}
      <section className={styles.feedSecao}>
        <div className={styles.feedTopo}>
          <h2 className={styles.secaoTitulo}>Últimas transferências</h2>
          <div className={styles.feedAbas}>
            {ABAS_FEED.map((a) => (
              <button
                key={a.id}
                type="button"
                className={abaFeed === a.id ? styles.feedAbaAtiva : ''}
                onClick={() => setAbaFeed(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {feed.length === 0 ? (
          <p className={styles.msgVazio}>Nada por aqui ainda.</p>
        ) : (
          <div className={styles.feedGrid}>
            {feed.map((c) => (
              <div key={c.id} className={`${styles.transferencia} ${styles[c.status] || ''}`}>
                <Link to={`/jogador/${c.jogadorId}`} className={styles.trJogador}>
                  {c.jogadorUsername || c.jogadorNome || 'Jogador'}
                </Link>
                <span className={styles.trSeta}>➜</span>
                {clubesExistentes.has(c.clubeId) ? (
                  <Link to={`/clube/${c.clubeId}`} className={styles.trClube}>
                    {c.clubeNome || 'Clube'}
                  </Link>
                ) : (
                  // clube já apagado: mostra o nome, mas sem link quebrado
                  <span className={styles.trClube}>{c.clubeNome || 'Clube'}</span>
                )}
                {c.posicao && <span className={styles.trPosicao}>{c.posicao}</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
