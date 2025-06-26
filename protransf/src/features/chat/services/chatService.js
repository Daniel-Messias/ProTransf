import { db } from '../../../services/firebase';

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

/**
 * Cria um novo chat entre dois usuários, se ainda não existir.
 * Retorna o ID do chat.
 */
export const criarOuAbrirChat = async (uid1, uid2) => {
  const q = query(collection(db, 'chats'), where('membros', 'array-contains', uid1));
  const snap = await getDocs(q);

  // Verifica se já existe um chat entre os dois usuários
  for (let docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.membros.includes(uid2)) {
      return docSnap.id;
    }
  }

  // Se não existe, cria um novo
  const novoChatRef = doc(collection(db, 'chats'));
  await setDoc(novoChatRef, {
    membros: [uid1, uid2],
    criadoEm: serverTimestamp()
  });

  return novoChatRef.id;
};

/**
 * Envia uma mensagem para um chat específico.
 * Agora cria também uma notificação para o destinatário.
 */
export const enviarMensagem = async (chatId, texto, remetente, destinatario) => {
  const mensagensRef = collection(db, 'chats', chatId, 'mensagens');
  await addDoc(mensagensRef, {
    texto,
    remetente,
    timestamp: serverTimestamp()
  });

  // Cria notificação para destinatário se diferente do remetente
  if (destinatario && remetente !== destinatario) {
    const notificacoesRef = collection(db, 'notificacoes');
    await addDoc(notificacoesRef, {
      tipo: 'mensagem',
      texto: `Você recebeu uma nova mensagem.`,
      remetente,
      destinatario,
      lida: false,
      timestamp: serverTimestamp()
    });
  }
};

/**
 * Escuta mensagens em tempo real e dispara um callback quando houver mudanças.
 */
export const ouvirMensagens = (chatId, callback) => {
  const q = query(
    collection(db, 'chats', chatId, 'mensagens'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(msgs);
  });
};
