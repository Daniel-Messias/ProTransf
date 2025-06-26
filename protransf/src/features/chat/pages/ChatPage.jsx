import React, { useEffect, useState } from 'react';
import { auth } from '../../../services/firebase';
import { criarOuAbrirChat } from '../services/chatService';
import ChatBox from '../components/ChatBox';

export default function ChatPage({ destinatarioId }) {
  const [chatId, setChatId] = useState(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    async function iniciarChat() {
      if (!currentUser || !destinatarioId) return;

      const id = await criarOuAbrirChat(currentUser.uid, destinatarioId);
      setChatId(id);
    }

    iniciarChat();
  }, [destinatarioId, currentUser]);

  if (!chatId) {
    return <p>Carregando chat...</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Chat com jogador</h2>
      <ChatBox chatId={chatId} destinatarioId={destinatarioId} />
    </div>
  );
}
