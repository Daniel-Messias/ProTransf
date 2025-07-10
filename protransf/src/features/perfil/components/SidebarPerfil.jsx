import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles/SidebarPerfil.module.css';
import { auth, db, storage } from '../../../services/firebase';
import { doc, updateDoc, collection, query, where, getDocs, onSnapshot, getDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { GiGamepad, GiCardDiscard, GiConfirmed, GiCancel } from 'react-icons/gi';
import { AiOutlineEdit, AiOutlineSave, AiOutlineClose, AiOutlineMail } from 'react-icons/ai';
import CentralNotificacoes from './CentralNotificacoes.jsx';
import Historico from './Historico.jsx';
import AmistososRecebidos from './AmistososRecebidos';

export default function SidebarPerfil({ jogador }) {
  
  const inputRef = useRef();

  const currentUser = auth.currentUser;

  // Detecta se o usuário logado é o dono do perfil
  const isDonoPerfil = currentUser && currentUser.uid === jogador.id;
  console.log('jogador completo:', jogador);

  // Estado modo edição, habilitado só para dono do perfil
  const [modoEdicao, setModoEdicao] = useState(false);

  // Se usuário não for dono do perfil, garantir modo edição desligado
  useEffect(() => {
    if (!isDonoPerfil) setModoEdicao(false);
  }, [isDonoPerfil]);

  const [contatos, setContatos] = useState({
    whatsapp: jogador.whatsapp || '',
    instagram: jogador.instagram || ''
  });

  const [uploading, setUploading] = useState(false);

  const [convites, setConvites] = useState([]);
  const [loadingConvites, setLoadingConvites] = useState(true);

  const [amistosos, setAmistosos] = useState([]);
  const [loadingAmistosos, setLoadingAmistosos] = useState(true);
  const [usuarioExtra, setUsuarioExtra] = useState(null);


  useEffect(() => {
  if (!jogador.id) return;

  setLoadingConvites(true);

  const qJogador = query(
    collection(db, 'convites'),
    where('jogadorId', '==', jogador.id)
  );

  const qClube = jogador.clubeAtualId
    ? query(
        collection(db, 'convites'),
        where('clubeId', '==', jogador.clubeAtualId)
      )
    : null;

  const unsubscribes = [];

  // Listener convites jogador
  const unsubscribeJogador = onSnapshot(qJogador, (snapshot) => {
    // NÃO sobrescrever o tipo aqui!
    const convitesJogador = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setConvites(prev => {
      // filtra os convites anteriores que não são desse jogador
      const outrosConvites = prev.filter(c => c.jogadorId !== jogador.id);
      return [...convitesJogador, ...outrosConvites];
    });
    setLoadingConvites(false);
  });
  unsubscribes.push(unsubscribeJogador);

  // Listener convites clube
  if (qClube) {
    const unsubscribeClube = onSnapshot(qClube, (snapshot) => {
      // NÃO sobrescrever o tipo aqui!
      const convitesClube = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConvites(prev => {
        // filtra os convites anteriores que não são desse clube
        const outrosConvites = prev.filter(c => c.clubeId !== jogador.clubeAtualId);
        return [...outrosConvites, ...convitesClube];
      });
      setLoadingConvites(false);
    });
    unsubscribes.push(unsubscribeClube);
  }

  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
}, [jogador.id, jogador.clubeAtualId]);


  // Carregar amistosos para clube atual do jogador
  useEffect(() => {
    async function carregarAmistosos() {
      if (!jogador.clubeAtualId) {
        setAmistosos([]);
        setLoadingAmistosos(false);
        return;
      }
      setLoadingAmistosos(true);
      try {
        const q = query(
  collection(db, 'amistosos'),
  where('destinatarioClubeId', '==', jogador.clubeAtualId)
);
        const querySnapshot = await getDocs(q);
        const dados = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAmistosos(dados);
      } catch (error) {
        console.error('Erro ao carregar amistosos:', error);
      } finally {
        setLoadingAmistosos(false);
      }
    }
    carregarAmistosos();
  }, [jogador.clubeAtualId]);
  useEffect(() => {
  async function buscarDadosExtras() {
    if (!currentUser) return;

    try {
      const docRef = doc(db, 'usuarios', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUsuarioExtra(docSnap.data());
      }
    } catch (error) {
      console.error('Erro ao buscar dados extras do usuário:', error);
    }
  }

  buscarDadosExtras();
}, [currentUser]);


  const atualizarResultadoAmistoso = async (amistosoId, resultado) => {
  try {
    const amistosoRef = doc(db, 'amistosos', amistosoId);
    await updateDoc(amistosoRef, { resultado });
    
    // Atualiza o estado local para mostrar o resultado na UI sem recarregar
    setAmistosos(prev =>
      prev.map(a =>
        a.id === amistosoId ? { ...a, resultado } : a
      )
    );

    alert('Resultado do amistoso atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar resultado do amistoso:', error);
    alert('Erro ao atualizar resultado. Tente novamente.');
  }
};


  // Upload foto/avatar
  const handleImageClick = () => {
    if (modoEdicao) inputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uid = currentUser.uid;
      const storageRef = ref(storage, `avatars/${uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const userRef = doc(db, 'usuarios', uid);
      await updateDoc(userRef, { fotoURL: downloadURL });
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Erro ao atualizar foto.');
    } finally {
      setUploading(false);
    }
  };

  // Contatos editar
  const handleChangeContato = (e) => {
    const { name, value } = e.target;
    setContatos(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvarContatos = async () => {
    try {
      const uid = currentUser.uid;
      const userRef = doc(db, 'usuarios', uid);
      await updateDoc(userRef, {
        whatsapp: contatos.whatsapp,
        instagram: contatos.instagram
      });
      alert('Contatos atualizados com sucesso!');
      setModoEdicao(false);
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      alert('Erro ao salvar contatos. Tente novamente.');
    }
  };

  // Mudar senha
  const handleMudarSenha = () => {
    const email = currentUser.email;
    auth.sendPasswordResetEmail(email)
      .then(() => alert('Link de redefinição de senha enviado.'))
      .catch(err => alert('Erro ao enviar email: ' + err.message));
  };

  // Atualizar status convites (aceitar/recusar)
  const handleAtualizarStatusConvite = async (conviteId, novoStatus, nomeClube, clubeId, numeroCamisa) => {
  try {
    const conviteRef = doc(db, 'convites', conviteId);
    await updateDoc(conviteRef, { status: novoStatus });

    setConvites(prev =>
      prev.map(conv =>
        conv.id === conviteId ? { ...conv, status: novoStatus } : conv
      )
    );

    if (novoStatus === 'aceito') {
      const userRef = doc(db, 'usuarios', jogador.id);

      // Atualiza o perfil do jogador com o clube correto
      await updateDoc(userRef, {
        status: 'Contratado',
        clubeAtual: nomeClube || '',
        clubeAtualId: clubeId || '',
        numeroCamisa: numeroCamisa || '',
      });
    }

    alert(`Convite ${novoStatus === 'aceito' ? 'aceito' : 'recusado'} com sucesso!`);
  } catch (error) {
    console.error('Erro ao atualizar convite:', error);
    alert('Erro ao atualizar convite. Tente novamente.');
  }
};
;

  // Amistosos: aceitar e recusar
  const handleDataAgendadaChange = (amistosoId, valorData) => {
    setAmistosos(prev =>
      prev.map(a =>
        a.id === amistosoId
          ? { ...a, dataAgendada: { seconds: Math.floor(new Date(valorData).getTime() / 1000) } }
          : a
      )
    );
  };

  const aceitarAmistoso = async (amistosoId, dataAgendada) => {
    if (!dataAgendada) {
      alert('Por favor, selecione uma data para o amistoso antes de aceitar.');
      return;
    }
    try {
      const amistosoRef = doc(db, 'amistosos', amistosoId);
      await updateDoc(amistosoRef, { status: 'aceito', dataAgendada });
      setAmistosos(prev =>
        prev.map(a => a.id === amistosoId ? { ...a, status: 'aceito' } : a)
      );
      alert('Amistoso aceito e data agendada com sucesso!');
    } catch (error) {
      console.error('Erro ao aceitar amistoso:', error);
      alert('Erro ao aceitar amistoso. Tente novamente.');
    }
  };

  const recusarAmistoso = async (amistosoId) => {
    try {
      const amistosoRef = doc(db, 'amistosos', amistosoId);
      await updateDoc(amistosoRef, { status: 'recusado' });
      setAmistosos(prev =>
        prev.map(a => a.id === amistosoId ? { ...a, status: 'recusado' } : a)
      );
      alert('Amistoso recusado.');
    } catch (error) {
      console.error('Erro ao recusar amistoso:', error);
      alert('Erro ao recusar amistoso. Tente novamente.');
    }
  };

  // Botão chamar amistoso — só aparece se usuário logado for clube ou clube_jogador e NÃO for dono do perfil
  const tipoUsuario = usuarioExtra?.tipo || '';
const clubeAtualIdUsuario = usuarioExtra?.clubeAtualId || null;

const podeChamarAmistoso = currentUser &&
  ['clube', 'clube_jogador'].includes(tipoUsuario) &&
  !isDonoPerfil;

// Estado para mostrar/ocultar modal de convite amistoso
const [mostrarModalChamarAmistoso, setMostrarModalChamarAmistoso] = useState(false);

// Estado para guardar data e hora escolhida no convite
const [dataHoraAmistoso, setDataHoraAmistoso] = useState('');

// Função para abrir o modal
const abrirModalChamarAmistoso = () => {
  setDataHoraAmistoso('');
  setMostrarModalChamarAmistoso(true);
};

// Função para fechar o modal
const fecharModalChamarAmistoso = () => {
  setMostrarModalChamarAmistoso(false);
};

// Função para chamar amistoso - cria documento no Firestore
const handleChamarAmistoso = async () => {
  if (!dataHoraAmistoso) {
    alert('Por favor, selecione data e hora para o amistoso.');
    return;
  }

  try {
    await addDoc(collection(db, 'amistosos'), {
  remetenteClubeId: clubeAtualIdUsuario,
  remetenteNome: usuarioExtra?.nome || 'Clube desconhecido',
  destinatarioClubeId: jogador.clubeAtualId || null,
  destinatarioNome: jogador.clubeAtual || 'Clube desconhecido',
  status: 'pendente',
  dataCriacao: new Date(),
  dataAgendada: {
    seconds: Math.floor(new Date(dataHoraAmistoso).getTime() / 1000)
  }
});


    alert('Convite para amistoso enviado com sucesso!');
    fecharModalChamarAmistoso();

  } catch (error) {
    console.error('Erro ao enviar convite de amistoso:', error);
    alert('Erro ao enviar convite. Tente novamente.');
  }
};

  return (
    <aside className={styles.sidebar}>
      {/* Avatar e nome */}
      <div
        className={styles.avatarContainer}
        onClick={handleImageClick}
        title={modoEdicao ? 'Clique para mudar avatar' : ''}
        style={{ cursor: modoEdicao ? 'pointer' : 'default' }}
      >
        {jogador.fotoURL ? (
          <img src={jogador.fotoURL} alt="Avatar" className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <GiGamepad size={60} color="#00FFF7" />
            <span className={styles.avatarInitial}>{jogador.nome?.charAt(0).toUpperCase() || '?'}</span>
          </div>
        )}
        {uploading && <p className={styles.uploading}>Enviando...</p>}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className={styles.info}>
        <h2>{jogador.nome}</h2>
      </div>

      {/* Botão mudar senha - só no modo edição do dono */}
      {modoEdicao && isDonoPerfil && (
        <button className={styles.btn} onClick={handleMudarSenha}>
          <AiOutlineMail style={{ marginRight: 6 }} />
          Mudar Senha
        </button>
      )}

      {/* Contatos */}
      <div className={styles.section}>
        <h4> Contatos</h4>
        {modoEdicao && isDonoPerfil ? (
          <>
            <label>
              WhatsApp:
              <input
                type="text"
                name="whatsapp"
                value={contatos.whatsapp}
                onChange={handleChangeContato}
                placeholder="Número com DDD"
              />
            </label>
            <label>
              Instagram:
              <input
                type="text"
                name="instagram"
                value={contatos.instagram}
                onChange={handleChangeContato}
                placeholder="Ex: gamer123"
              />
            </label>
          </>
        ) : (
          <div className={styles.contatosLinks}>
            {jogador.whatsapp ? (
              <a
                href={`https://wa.me/${jogador.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
              >
                <FaWhatsapp size={24} color="#25D366" />
              </a>
            ) : (
              <p className={styles.naoInformado}>WhatsApp: Não informado</p>
            )}
            {jogador.instagram ? (
              <a
                href={`https://instagram.com/${jogador.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
              >
                <FaInstagram size={24} color="#C13584" />
              </a>
            ) : (
              <p className={styles.naoInformado}>Instagram: Não informado</p>
            )}
          </div>
        )}
      </div>

      {podeChamarAmistoso && (
  <>
    <button className={styles.btnAmistoso} onClick={abrirModalChamarAmistoso}>
      Chamar para Amistoso
    </button>

    {mostrarModalChamarAmistoso && (
      <div className={styles.modalAmistoso}>
        <h3>Chamar para Amistoso</h3>
        <label>
          Data e Hora:
          <input
            type="datetime-local"
            value={dataHoraAmistoso}
            onChange={e => setDataHoraAmistoso(e.target.value)}
          />
        </label>
        <div className={styles.modalBotoes}>
          <button onClick={handleChamarAmistoso} className={styles.btnConfirmar}>
            Enviar Convite
          </button>
          <button onClick={fecharModalChamarAmistoso} className={styles.btnCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    )}
  </>
)}


      {/* Histórico */}
      <Historico
  amistosos={amistosos}
  convites={convites}
  loadingAmistosos={loadingAmistosos}
  loadingConvites={loadingConvites}
/>

      {/* Central de Notificações (Convites) */}
     <CentralNotificacoes
  convites={convites}
  loadingConvites={loadingConvites}
  handleAtualizarStatusConvite={handleAtualizarStatusConvite}
  isDonoPerfil={isDonoPerfil}
  jogadorId={jogador.id}
  clubeId={jogador.clubeAtualId}
/>


      {/* Amistosos Recebidos */}
      <AmistososRecebidos
  amistosos={amistosos}
  isDonoPerfil={isDonoPerfil}
  handleDataAgendadaChange={handleDataAgendadaChange}
  aceitarAmistoso={aceitarAmistoso}
  recusarAmistoso={recusarAmistoso}
  atualizarResultadoAmistoso={atualizarResultadoAmistoso}  // <- aqui
/>


      {/* Botões editar (aparece só para dono) */}
      {isDonoPerfil && (
        <div className={styles.btnGroup}>
          {modoEdicao ? (
            <>
              <button
                className={styles.btnSalvar}
                onClick={handleSalvarContatos}
              >
                <AiOutlineSave style={{ marginRight: 6 }} />
                Salvar
              </button>
              <button
                className={styles.btnCancelar}
                onClick={() => setModoEdicao(false)}
              >
                <AiOutlineClose style={{ marginRight: 6 }} />
                Cancelar
              </button>
            </>
          ) : (
            <button
              className={styles.editBtn}
              onClick={() => setModoEdicao(true)}
            >
              <AiOutlineEdit style={{ marginRight: 6 }} />
              Editar Perfil
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
