import React, { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db, auth } from '../../../services/firebase';
import styles from '../transferencia.module.css';
import CardTransferencia from '../components/CardTransferencia';

export default function Transferencia() {
  const [transferenciasAceitas, setTransferenciasAceitas] = useState([]);
  const [transferenciasRecusadas, setTransferenciasRecusadas] = useState([]);
  const [transferenciasPendentes, setTransferenciasPendentes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [posicaoFiltro, setPosicaoFiltro] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [nomeClubeAtual, setNomeClubeAtual] = useState('');

  // Índices para controle do carrossel
  const [indexAceitas, setIndexAceitas] = useState(0);
  const [indexRecusadas, setIndexRecusadas] = useState(0);
  const [indexPendentes, setIndexPendentes] = useState(0);

  const itensPorPagina = 5;

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
    let q;
    if (posicaoFiltro) {
      q = query(
        usuariosRef,
        where('status', '==', 'Livre'),
        where('posicaoPrimaria', '==', posicaoFiltro)
      );
    } else {
      q = query(usuariosRef, where('status', '==', 'Livre'));
    }
    promessas.push(getDocs(q));
  }

  if (filtro === 'clubes' || filtro === 'todos') {
    const q = query(clubesRef, where('procura', '==', 'sim'));
    promessas.push(getDocs(q));
  }

  // Aguarda as promessas
  const resultados = await Promise.all(promessas);

  console.log('Resultados da busca:', resultados);

  // Se não teve resultado para jogadores ou clubes, cria vazio para evitar erro
  const jogadoresSnap = filtro === 'clubes' ? { docs: [] } : (resultados[0] || { docs: [] });
  const clubesSnap = filtro === 'jogadores' ? { docs: [] } : (resultados[1] || { docs: [] });

  const jogadores = (jogadoresSnap.docs || []).map(doc => ({
    id: doc.id,
    tipo: 'jogador',
    ...doc.data(),
  }));

  const clubes = (clubesSnap.docs || []).map(doc => ({
    id: doc.id,
    tipo: 'clube',
    ...doc.data(),
  }));

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
      setFunc(docsEnriquecidos.slice(-100).reverse()); // Pega até 100 para dar mais "material" pro carrossel
    }

    const unsubAceitas = onSnapshot(qAceitas, snap => {
      carregarTransferencias(snap, setTransferenciasAceitas);
      setIndexAceitas(0); // resetar índice ao atualizar dados
    });

    const unsubRecusadas = onSnapshot(qRecusadas, snap => {
      carregarTransferencias(snap, setTransferenciasRecusadas);
      setIndexRecusadas(0);
    });

    const unsubPendentes = onSnapshot(qPendentes, snap => {
      carregarTransferencias(snap, setTransferenciasPendentes);
      setIndexPendentes(0);
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

  useEffect(() => {
    async function carregarUsuarioEClube() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'usuarios', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const usuarioData = { id: user.uid, ...userSnap.data() };
          setUsuarioAtual(usuarioData);

          if (usuarioData.tipo === 'clube' || usuarioData.tipo === 'clube_jogador') {
            const clubesRef = collection(db, 'clubes');
            const q = query(clubesRef, where('donoUid', '==', user.uid));
            const clubesSnap = await getDocs(q);
            if (!clubesSnap.empty) {
              const clubeDoc = clubesSnap.docs[0].data();
              setNomeClubeAtual(clubeDoc.nome || '');
            }
          }
        }
      }
    }
    carregarUsuarioEClube();
  }, []);

  
  const enviarConvite = async (clube, jogador) => {
    try {
      const conviteRef = doc(collection(db, 'convites'));
      await setDoc(conviteRef, {
        tipo: 'clube_para_jogador',
        clubeId: clube.id,
        clubeNome: nomeClubeAtual || clube.nome || 'Clube',
        jogadorId: jogador.id,
        jogadorUsername: jogador.username || jogador.nome || 'Jogador',
        status: 'pendente',
        posicao: jogador.posicaoPrimaria || '',
        criadoEm: new Date()
      });
      alert('Convite enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      alert('Erro ao enviar convite');
    }
  };

  const enviarPedido = async (jogador, clube) => {
    try {
      const conviteRef = doc(collection(db, 'convites'));
      await setDoc(conviteRef, {
        tipo: 'jogador_para_clube',
        clubeId: clube.id,
        clubeNome: clube.nome || 'Clube',
        jogadorId: jogador.id,
        jogadorUsername: jogador.username || jogador.nome || 'Jogador',
        status: 'pendente',
        posicao: jogador.posicaoPrimaria || '',
        criadoEm: new Date()
      });
      alert('Pedido enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Erro ao enviar pedido');
    }
  };

  // Função para pegar fatia do carrossel, com limite de itensPorPagina
  function getSlice(arr, index) {
    return arr.slice(index, index + itensPorPagina);
  }

  // Efeitos para avançar o índice do carrossel automaticamente
  useEffect(() => {
    if (transferenciasAceitas.length <= itensPorPagina) return;

    const timer = setInterval(() => {
      setIndexAceitas(prev => (prev + 1) % (transferenciasAceitas.length - itensPorPagina + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [transferenciasAceitas]);

  useEffect(() => {
    if (transferenciasRecusadas.length <= itensPorPagina) return;

    const timer = setInterval(() => {
      setIndexRecusadas(prev => (prev + 1) % (transferenciasRecusadas.length - itensPorPagina + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [transferenciasRecusadas]);

  useEffect(() => {
    if (transferenciasPendentes.length <= itensPorPagina) return;

    const timer = setInterval(() => {
      setIndexPendentes(prev => (prev + 1) % (transferenciasPendentes.length - itensPorPagina + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [transferenciasPendentes]);

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
              <div key={index} className={styles.cardBusca}>
                <CardTransferencia dados={item} tipo={item.tipo} />

                {usuarioAtual && usuarioAtual.tipo?.includes('clube') && item.tipo === 'jogador' && (
                  <button onClick={() => enviarConvite(usuarioAtual, item)} className={styles.botaoConvite}>
                    Enviar convite
                  </button>
                )}

                {usuarioAtual && usuarioAtual.tipo === 'jogador' && item.tipo === 'clube' && (
                  <button onClick={() => enviarPedido(usuarioAtual, item)} className={styles.botaoConvite}>
                    Pedir para entrar
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <hr />

      <h2>🔄 Últimas Transferências</h2>

      <div className={styles.transferenciaSection}>
        <h3 className={styles['status-aceitas']}>Aceitas</h3>
        {transferenciasAceitas.length === 0 ? (
          <p className={styles.msgVazio}>Nenhuma transferência aceita.</p>
        ) : (
          <div className={styles.carrossel}>
            {getSlice(transferenciasAceitas, indexAceitas).map(item => (
              <CardTransferencia key={item.id} dados={item} tipo="transferencia" />
            ))}
          </div>
        )}
      </div>

      <div className={styles.transferenciaSection}>
        <h3 className={styles['status-recusadas']}>Melou</h3>
        {transferenciasRecusadas.length === 0 ? (
          <p className={styles.msgVazio}>Nenhuma transferência recusada.</p>
        ) : (
          <div className={styles.carrossel}>
            {getSlice(transferenciasRecusadas, indexRecusadas).map(item => (
              <CardTransferencia key={item.id} dados={item} tipo="transferencia" />
            ))}
          </div>
        )}
      </div>

      <div className={styles.transferenciaSection}>
        <h3 className={styles['status-pendentes']}>Pendentes</h3>
        {transferenciasPendentes.length === 0 ? (
          <p className={styles.msgVazio}>Nenhuma transferência pendente.</p>
        ) : (
          <div className={styles.carrossel}>
            {getSlice(transferenciasPendentes, indexPendentes).map(item => (
              <CardTransferencia key={item.id} dados={item} tipo="transferencia" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
