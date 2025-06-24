import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import styles from '../transferencia.module.css';
import CardTransferencia from '../components/CardTransferencia';

export default function Transferencia() {
  const [transferenciasAceitas, setTransferenciasAceitas] = useState([]);
  const [transferenciasRecusadas, setTransferenciasRecusadas] = useState([]);
  const [transferenciasPendentes, setTransferenciasPendentes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [posicaoFiltro, setPosicaoFiltro] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);

  // Usa os nomes já presentes no documento do convite
  function enriquecerTransferencia(item) {
  return {
    ...item,
    clubeNome: item.clubeNome || 'Time não encontrado',
    jogadorNome: item.jogadorUsername || 'Jogador não encontrado',
    posicao: item.posicao || 'N/A',
  };
}


  const buscar = useCallback(async () => {
    const usuariosRef = collection(db, 'usuarios');
    const clubesRef = collection(db, 'clubes');
    const promessas = [];

    if (filtro === 'jogadores' || filtro === 'todos') {
      let q = query(usuariosRef, where('status', '==', 'Livre no mercado'));
      if (posicaoFiltro) {
        q = query(
          usuariosRef,
          where('status', '==', 'Livre no mercado'),
          where('posicaoPrimaria', '==', posicaoFiltro)
        );
      }
      promessas.push(getDocs(q));
    }

    if (filtro === 'clubes' || filtro === 'todos') {
      let q = query(clubesRef, where('procura', '==', 'sim'));
      promessas.push(getDocs(q));
    }

    const [jogadoresSnap, clubesSnap] = await Promise.all([
      filtro === 'clubes' ? { docs: [] } : promessas[0],
      filtro === 'jogadores' ? { docs: [] } : promessas[1] || promessas[0],
    ]);

    const jogadores = jogadoresSnap.docs.map(doc => ({ id: doc.id, tipo: 'jogador', ...doc.data() }));
    const clubes = clubesSnap.docs.map(doc => ({ id: doc.id, tipo: 'clube', ...doc.data() }));

    setResultadosBusca([...jogadores, ...clubes]);
  }, [filtro, posicaoFiltro]);

  useEffect(() => {
    const ref = collection(db, 'convites');

    const qAceitas = query(ref, where('status', '==', 'aceito'));
    const qRecusadas = query(ref, where('status', '==', 'recusado'));
    const qPendentes = query(ref, where('status', '==', 'pendente'));

    async function carregarTransferencias(snap, setFunc) {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const docsEnriquecidos = docs.map(enriquecerTransferencia);
      setFunc(docsEnriquecidos.slice(-5).reverse());
    }

    const unsubAceitas = onSnapshot(qAceitas, snap => {
      carregarTransferencias(snap, setTransferenciasAceitas);
    });

    const unsubRecusadas = onSnapshot(qRecusadas, snap => {
      carregarTransferencias(snap, setTransferenciasRecusadas);
    });

    const unsubPendentes = onSnapshot(qPendentes, snap => {
      carregarTransferencias(snap, setTransferenciasPendentes);
    });

    return () => {
      unsubAceitas();
      unsubRecusadas();
      unsubPendentes();
    };
  }, []);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return (
    <section className={styles.container}>
      <h2>🔍 Buscar Jogadores e Clubes</h2>

      <div className={styles.filtros}>
        <select value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="jogadores">Jogadores livres</option>
          <option value="clubes">Clubes buscando jogadores</option>
        </select>

        {filtro === 'jogadores' && (
          <select value={posicaoFiltro} onChange={e => setPosicaoFiltro(e.target.value)}>
            <option value="">Todas as posições</option>
            <option value="Goleiro">Goleiro</option>
            <option value="Zagueiro">Zagueiro</option>
            <option value="Lateral">Lateral</option>
            <option value="Volante">Volante</option>
            <option value="Meio-campo">Meio-campo</option>
            <option value="Atacante">Atacante</option>
          </select>
        )}
      </div>

      {filtro !== 'todos' && (
        <div className={styles.resultados}>
          {resultadosBusca.length === 0 ? (
            <p>Nenhum resultado encontrado.</p>
          ) : (
            resultadosBusca.map((item, index) => (
              <CardTransferencia key={index} dados={item} tipo={item.tipo} />
            ))
          )}
        </div>
      )}

      <hr />

      <h2>🔄 Últimas Transferências</h2>

      <div className={styles.transferenciaSection}>
        <h3>Aceitas</h3>
        {transferenciasAceitas.length === 0 ? (
          <p className={styles.msgVazio}>Nenhuma transferência aceita.</p>
        ) : (
          transferenciasAceitas.map(item => (
            <CardTransferencia key={item.id} dados={item} tipo="transferencia" />
          ))
        )}
      </div>

      <div className={styles.transferenciaSection}>
        <h3>Recusadas</h3>
        {transferenciasRecusadas.length === 0 ? (
          <p className={styles.msgVazio}>Nenhuma transferência recusada.</p>
        ) : (
          transferenciasRecusadas.map(item => (
            <CardTransferencia key={item.id} dados={item} tipo="transferencia" />
          ))
        )}
      </div>

      <div className={styles.transferenciaSection}>
        <h3>Pendentes</h3>
        {transferenciasPendentes.length === 0 ? (
          <p className={styles.msgVazio}>Nenhuma transferência pendente.</p>
        ) : (
          transferenciasPendentes.map(item => (
            <CardTransferencia key={item.id} dados={item} tipo="transferencia" />
          ))
        )}
      </div>
    </section>
  );
}
