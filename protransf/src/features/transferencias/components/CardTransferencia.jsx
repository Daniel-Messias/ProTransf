import React, { useState, useEffect } from 'react';
import styles from './CardTransferencia.module.css';
import { Link } from 'react-router-dom';
import { auth, db } from '../../../services/firebase';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function CardTransferencia({ dados, tipo }) {
  const user = auth.currentUser;

  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [clubeAtualIdUsuario, setClubeAtualIdUsuario] = useState(null);
  const [nomeClubeUsuario, setNomeClubeUsuario] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Buscar dados extras do usuário logado (tipo, clubeAtualId, nome do clube)
  useEffect(() => {
    async function fetchDadosUsuario() {
      if (!user) return;
      try {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTipoUsuario(data.tipo);
          setClubeAtualIdUsuario(data.clubeAtualId || null);
          setNomeClubeUsuario(data.clubeAtual || null);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    }
    fetchDadosUsuario();
  }, [user]);

  const isTransferencia = tipo === 'transferencia' && dados.clubeNome && dados.jogadorNome;
  const isJogador = tipo === 'jogador' || tipo === 'clube_jogador';
  const isClube = tipo === 'clube';

  // Permissão para enviar convite
  const podeConvidar = !!user && (
    (isJogador && tipoUsuario === 'clube') ||
    (isClube && (tipoUsuario === 'jogador' || tipoUsuario === 'clube_jogador'))
  );

  // Função para enviar convite no Firestore
  const enviarConvite = async () => {
    if (!user) {
      alert('Você precisa estar logado para enviar convites.');
      return;
    }
    setEnviando(true);
    try {
      if (isJogador) {
        // Clube convidando jogador
        await addDoc(collection(db, 'convites'), {
          tipo: 'clube_para_jogador',
          clubeId: clubeAtualIdUsuario || '',
          clubeNome: nomeClubeUsuario || '',
          jogadorId: dados.id,
          jogadorNome: dados.nome,
          status: 'pendente',
          criadoEm: serverTimestamp(),
          numeroCamisa: dados.numeroCamisa || '',
          plataforma: dados.plataforma || '',
        });
      } else if (isClube) {
        // Jogador convidando clube
        await addDoc(collection(db, 'convites'), {
          tipo: 'jogador_para_clube',
          jogadorId: user.uid,
          jogadorNome: user.displayName || '',
          clubeId: dados.id,
          clubeNome: dados.nome,
          status: 'pendente',
          criadoEm: serverTimestamp(),
        });
      }
      alert('Convite enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      alert('Erro ao enviar convite. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleClick = () => {
    if (enviando) return;
    enviarConvite();
  };

  if (isTransferencia) {
    return (
      <div className={`${styles.cardTransferencia} ${styles[dados.status] || ''}`} role="region">
        <div className={styles.transferBox}>
          <div>
            <strong className={styles.label}>Clube:</strong>
            <p className={styles.value}>{dados.clubeNome}</p>
          </div>
          <div>
            <strong className={styles.label}>Jogador:</strong>
            <p className={styles.value}>{dados.jogadorNome}</p>
          </div>
          <div>
            <strong className={styles.label}>Posição:</strong>
            <p className={styles.value}>{dados.posicao}</p>
            <span
              className={`${styles.statusBadge} ${
                dados.status === 'aceito'
                  ? styles['status-aceito']
                  : dados.status === 'recusado'
                  ? styles['status-recusado']
                  : styles['status-pendente']
              }`}
            >
              {dados.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.card} ${isJogador ? styles.cardJogador : styles.cardClube}`}
      role="region"
      aria-label={`Card de ${tipo}`}
    >
      <div className={styles.info}>
        {isJogador ? (
          <div className={styles.fichaJogador}>
            <h4 className={styles.nome}>{dados.nome || 'Jogador'}</h4>
            <p className={styles.username}>@{dados.username || 'usuario'}</p>

            <div className={styles.linha}>
              <span className={styles.icone}>⚽</span>
              <span className={styles.label}>Posição principal:</span>
              <span className={styles.valor}>{dados.posicaoPrimaria || dados.posicao || 'N/A'}</span>
            </div>

            {dados.posicaoSecundaria && (
              <div className={styles.linha}>
                <span className={styles.icone}>🎯</span>
                <span className={styles.label}>Posição secundária:</span>
                <span className={styles.valor}>{dados.posicaoSecundaria}</span>
              </div>
            )}

            {dados.numeroCamisa && (
              <div className={styles.linha}>
                <span className={styles.icone}>🎽</span>
                <span className={styles.label}>Camisa:</span>
                <span className={styles.numeroCamisa}>{dados.numeroCamisa}</span>
              </div>
            )}

            <div className={styles.linha}>
              <span className={styles.icone}>🎮</span>
              <span className={styles.label}>Plataforma:</span>
              <span className={styles.valor}>{dados.plataforma || 'N/A'}</span>
            </div>

            <Link
              to={`/perfil/${dados.id}`}
              className={styles.link}
              aria-label={`Ver perfil do jogador ${dados.username}`}
            >
              Ver Perfil
            </Link>
          </div>
        ) : (
          <div className={styles.fichaClube}>
            <h4 className={styles.nome}>{dados.nome || 'Clube'}</h4>

            <div className={styles.linha}>
              <span className={styles.icone}>🔎</span>
              <span className={styles.label}>Buscando jogadores:</span>
              <span className={styles.valor}>{dados.estaBuscando ? 'Sim' : 'Não'}</span>
            </div>

            <div className={styles.linha}>
              <span className={styles.icone}>🏆</span>
              <span className={styles.label}>Campeonatos:</span>
              <span className={styles.valor}>
                {dados.campeonatos && dados.campeonatos.length > 0
                  ? dados.campeonatos.join(', ')
                  : 'Nenhum campeonato registrado'}
              </span>
            </div>

            <Link
              to={`/perfil/${dados.criadoPorUsuarioId}`}
              className={styles.link}
              aria-label={`Ver perfil do dono do clube ${dados.nome}`}
            >
              Ver Perfil
            </Link>
          </div>
        )}
      </div>

      {podeConvidar && (
        <button
          className={styles.btn}
          onClick={handleClick}
          aria-label={isJogador ? `Enviar convite para ${dados.username}` : `Enviar pedido para ${dados.nome}`}
          type="button"
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : isJogador ? 'Enviar Convite' : 'Enviar Pedido'}
        </button>
      )}
    </div>
  );
}
