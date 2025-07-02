import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles/SidebarPerfil.module.css';
import { auth, db, storage } from '../../../services/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Ícones gamer e sociais mais temáticos
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { GiGamepad, GiCardDiscard, GiChatBubble, GiConfirmed, GiCancel } from 'react-icons/gi';
import { AiOutlineEdit, AiOutlineSave, AiOutlineClose, AiOutlineMail } from 'react-icons/ai';

import ChatBox from '../../chat/components/ChatBox';

export default function SidebarPerfil({ jogador }) {
  const inputRef = useRef();

  const [mostrarChat, setMostrarChat] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [contatos, setContatos] = useState({
    whatsapp: jogador.whatsapp || '',
    instagram: jogador.instagram || ''
  });

  const [convites, setConvites] = useState([]);
  const [loadingConvites, setLoadingConvites] = useState(true);
  const [amistosos, setAmistosos] = useState([]);
  const [loadingAmistosos, setLoadingAmistosos] = useState(true);

  const [chatId, setChatId] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const currentUser = auth.currentUser;

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
          where('destinatarioClubeId', '==', jogador.clubeAtualId),
          where('status', '==', 'pendente')
        );
        const querySnapshot = await getDocs(q);
        const dados = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
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
    async function carregarConvites() {
      if (!jogador.uid) return;
      setLoadingConvites(true);
      try {
        const q = query(
          collection(db, 'convites'),
          where('jogadorId', '==', jogador.uid)
        );
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConvites(lista);
      } catch (err) {
        console.error('Erro ao carregar convites:', err);
      } finally {
        setLoadingConvites(false);
      }
    }
    carregarConvites();
  }, [jogador.uid]);

  useEffect(() => {
    async function iniciarChat() {
      if (!currentUser || !jogador.uid) return;
      const { criarOuAbrirChat } = await import('../../chat/services/chatService');
      const id = await criarOuAbrirChat(currentUser.uid, jogador.uid);
      setChatId(id);
    }
    iniciarChat();
  }, [currentUser, jogador.uid]);

  useEffect(() => {
    if (!chatId) return;
    const { ouvirMensagens } = require('../../chat/services/chatService');
    const unsubscribe = ouvirMensagens(chatId, (msgs) => {
      setMensagens(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  const mensagensNaoLidas = mensagens.filter((msg) => msg.remetente === jogador.uid).length;

  const handleImageClick = () => {
    if (modoEdicao) inputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const uid = auth.currentUser.uid;
      const storageRef = ref(storage, `avatars/${uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, 'usuarios', uid);
      await updateDoc(userRef, { fotoURL: downloadURL });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Erro ao atualizar foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditar = () => setModoEdicao(true);
  const handleCancelarEdicao = () => setModoEdicao(false);

  const handleChangeContato = (e) => {
    const { name, value } = e.target;
    setContatos((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvarContatos = async () => {
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, 'usuarios', uid);
      await updateDoc(userRef, {
        whatsapp: contatos.whatsapp,
        instagram: contatos.instagram
      });
      alert('Contatos atualizados com sucesso!');
      setModoEdicao(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      alert('Erro ao salvar contatos. Tente novamente.');
    }
  };

  const handleMudarSenha = () => {
    const email = auth.currentUser.email;
    auth.sendPasswordResetEmail(email)
      .then(() => alert('Link de redefinição de senha enviado.'))
      .catch((err) => alert('Erro ao enviar email: ' + err.message));
  };

  // ----- Novos handlers para amistosos -----

  const handleDataAgendadaChange = (amistosoId, valorData) => {
    setAmistosos((prev) =>
      prev.map((amistoso) =>
        amistoso.id === amistosoId
          ? { ...amistoso, dataAgendada: { seconds: Math.floor(new Date(valorData).getTime() / 1000) } }
          : amistoso
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
      await updateDoc(amistosoRef, {
        status: 'aceito',
        dataAgendada: dataAgendada
      });
      setAmistosos((prev) =>
        prev.map((amistoso) =>
          amistoso.id === amistosoId ? { ...amistoso, status: 'aceito' } : amistoso
        )
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
      setAmistosos((prev) =>
        prev.map((amistoso) =>
          amistoso.id === amistosoId ? { ...amistoso, status: 'recusado' } : amistoso
        )
      );
      alert('Amistoso recusado.');
    } catch (error) {
      console.error('Erro ao recusar amistoso:', error);
      alert('Erro ao recusar amistoso. Tente novamente.');
    }
  };

  // -----------------------------------------

  const handleAtualizarStatusConvite = async (conviteId, novoStatus, nomeClube) => {
    try {
      const conviteRef = doc(db, 'convites', conviteId);
      await updateDoc(conviteRef, { status: novoStatus });
      setConvites(prev =>
        prev.map(conv =>
          conv.id === conviteId ? { ...conv, status: novoStatus } : conv
        )
      );
      if (novoStatus === 'aceito') {
        const userRef = doc(db, 'usuarios', jogador.uid);
        await updateDoc(userRef, {
          status: 'Contratado',
          nomeClube: nomeClube
        });
      }
      alert(`Convite ${novoStatus === 'aceito' ? 'aceito' : 'recusado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar convite:', error);
      alert('Erro ao atualizar convite. Tente novamente.');
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Avatar e nome */}
      <div className={styles.avatarContainer} onClick={handleImageClick} title="Clique para mudar avatar">
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

      {modoEdicao && (
        <button className={styles.btn} onClick={handleMudarSenha}>
          <AiOutlineMail style={{ marginRight: 6 }} />
          Mudar Senha
        </button>
      )}

      {/* Contatos */}
      <div className={styles.section}>
        <h4> Contatos</h4>
        {modoEdicao ? (
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

      {/* Histórico */}
      <div className={styles.section}>
        <h4><GiCardDiscard style={{ color: '#00FFF7', marginRight: 6 }} /> Histórico</h4>
        {loadingAmistosos ? (
          <p>Carregando...</p>
        ) : amistosos.length === 0 ? (
          <p>Sem jogos disputados.</p>
        ) : (
          <ul className={styles.amistososList}>
            {amistosos.map(jogo => (
              <li key={jogo.id}>
                <strong>{new Date(jogo.data.seconds * 1000).toLocaleDateString()}</strong> — {jogo.resultado}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Convites */}
      <div className={styles.section}>
        <h4><GiConfirmed style={{ color: '#32FF7E', marginRight: 6 }} /> Central de Notificações</h4>
        {loadingConvites ? (
          <p>Carregando convites...</p>
        ) : convites.length === 0 ? (
          <p>Sem convites no momento.</p>
        ) : (
          <ul className={styles.convitesList}>
            {convites.map((convite) => (
              <li key={convite.id} className={styles.conviteItem}>
                <strong>{convite.nomeClube}</strong> —{' '}
                <span
                  className={`${styles.statusBadge} ${
                    convite.status === 'aceito'
                      ? styles.statusAceito
                      : convite.status === 'recusado'
                      ? styles.statusRecusado
                      : styles.statusPendente
                  }`}
                >
                  {convite.status}
                </span>
                {convite.status === 'pendente' && (
                  <div className={styles.acoesConvite}>
                    <button
                      onClick={() => handleAtualizarStatusConvite(convite.id, 'aceito', convite.nomeClube)}
                      className={`${styles.btnAceitar} ${styles.btnIcon}`}
                      title="Aceitar Convite"
                    >
                      <GiConfirmed />
                    </button>
                    <button
                      onClick={() => handleAtualizarStatusConvite(convite.id, 'recusado')}
                      className={`${styles.btnRecusar} ${styles.btnIcon}`}
                      title="Recusar Convite"
                    >
                      <GiCancel />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Amistosos Recebidos */}
        {amistosos.length > 0 && (
          <div className={styles.section}>
            <h4><GiGamepad style={{ color: '#ffcc00', marginRight: 6 }} /> Amistosos Recebidos</h4>
            <ul className={styles.convitesList}>
              {amistosos.map((amistoso) => (
                <li key={amistoso.id} className={styles.conviteItem}>
                  <strong>{amistoso.remetenteNome || 'Clube desconhecido'}</strong> chamou seu time para um amistoso.
                  <span className={styles.statusPendente}>{amistoso.status}</span>

                  {amistoso.status === 'pendente' && (
                    <div className={styles.acoesConvite}>
                      <input
                        type="datetime-local"
                        onChange={e => handleDataAgendadaChange(amistoso.id, e.target.value)}
                        value={
                          amistoso.dataAgendada
                            ? new Date(amistoso.dataAgendada.seconds * 1000).toISOString().slice(0, 16)
                            : ''
                        }
                        className={styles.inputDataAgendada}
                      />
                      <button
                        onClick={() => aceitarAmistoso(amistoso.id, amistoso.dataAgendada)}
                        className={styles.btnAceitar}
                        disabled={!amistoso.dataAgendada}
                        title="Aceitar Amistoso"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => recusarAmistoso(amistoso.id)}
                        className={styles.btnRecusar}
                        title="Recusar Amistoso"
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Chat */}
      {auth.currentUser.uid !== jogador.uid && (
        <div className={styles.section}>
          <h4>
            <GiChatBubble style={{ color: '#00FFF7', marginRight: 6 }} />
            Chat
            {mensagensNaoLidas > 0 && (
              <span className={styles.badge}>{mensagensNaoLidas}</span>
            )}
          </h4>

          {!mostrarChat ? (
            <button
              className={styles.editBtn}
              onClick={() => {
                if (!chatId) {
                  alert('Chat ainda está carregando, aguarde...');
                  return;
                }
                setMostrarChat(true);
                setMensagens([]);
              }}
            >
              <GiChatBubble style={{ marginRight: 6 }} />
              Abrir Chat com jogador
            </button>
          ) : (
            <ChatBox chatId={chatId} />
          )}
        </div>
      )}

      {/* Botões de editar */}
      <div className={styles.btnGroup}>
        {modoEdicao ? (
          <>
            <button className={styles.editBtn} onClick={handleSalvarContatos}>
              <AiOutlineSave style={{ marginRight: 6 }} />
              Salvar
            </button>
            <button className={styles.cancelBtn} onClick={handleCancelarEdicao}>
              <AiOutlineClose style={{ marginRight: 6 }} />
              Cancelar
            </button>
          </>
        ) : (
          <button className={styles.editBtn} onClick={handleEditar}>
            <AiOutlineEdit style={{ marginRight: 6 }} />
            Editar
          </button>
        )}
      </div>
    </aside>
  );
}
