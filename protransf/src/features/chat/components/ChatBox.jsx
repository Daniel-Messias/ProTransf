// src/features/chat/components/ChatBox.jsx
import React, { useEffect, useState } from 'react';
import styles from '../styles/ChatBox.module.css';
import { enviarMensagem, ouvirMensagens } from '../services/chatService';
import { auth } from '../../../services/firebase';

export default function ChatBox({ chatId }) {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = ouvirMensagens(chatId, setMensagens);
    return () => unsubscribe(); // limpa o listener ao desmontar
  }, [chatId]);

  const handleEnviar = async () => {
    if (!novaMensagem.trim()) return;

    if (!chatId) {
      alert('Chat não iniciado. Tente novamente mais tarde.');
      return;
    }

    await enviarMensagem(chatId, novaMensagem.trim(), auth.currentUser.uid);
    setNovaMensagem('');
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.mensagens}>
        {mensagens.map(msg => (
          <div
            key={msg.id}
            className={
              msg.remetente === auth.currentUser.uid
                ? styles.mensagemEnviada
                : styles.mensagemRecebida
            }
          >
            {msg.texto}
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Digite uma mensagem..."
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
        />
        <button onClick={handleEnviar}>Enviar</button>
      </div>
    </div>
  );
}
