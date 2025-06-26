import React, { useRef, useState, useEffect } from 'react';  // <-- adiciona useEffect aqui
import styles from '../styles/SidebarPerfil.module.css';
import { auth, db, storage } from '../../../services/firebase';
import { doc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'; // <-- adiciona imports do Firestore
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';

export default function SidebarPerfil({ jogador }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [contatos, setContatos] = useState({
    whatsapp: jogador.whatsapp || '',
    instagram: jogador.instagram || ''
  });

  const [convites, setConvites] = useState([]);
const [loadingConvites, setLoadingConvites] = useState(true);

  // Estado para os amistosos
  const [amistosos, setAmistosos] = useState([]);
  const [loadingAmistosos, setLoadingAmistosos] = useState(true);

  // Busca os 2 últimos amistosos do jogador no Firestore
  useEffect(() => {
    async function carregarAmistosos() {
      if (!jogador.uid) return; // garante que uid existe
      setLoadingAmistosos(true);
      try {
        const q = query(
          collection(db, 'amistosos'),
          where('jogadorId', '==', jogador.uid),
          orderBy('data', 'desc'),
          limit(2)
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
  }, [jogador.uid]);

  // Funções existentes (handleImageClick, handleFileChange, etc) ...

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

      window.location.reload(); // Força reload após salvar a imagem
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Erro ao atualizar foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditar = () => {
    setModoEdicao(true);
  };

  const handleCancelarEdicao = () => {
    setModoEdicao(false);
  };

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
  const handleAtualizarStatusConvite = async (conviteId, novoStatus, nomeClube) => {
  try {
    const conviteRef = doc(db, 'convites', conviteId);
    await updateDoc(conviteRef, { status: novoStatus });

    // Atualiza localmente
    setConvites(prev =>
      prev.map(conv =>
        conv.id === conviteId ? { ...conv, status: novoStatus } : conv
      )
    );

    // Se aceitou, atualiza status do jogador
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
      <div className={styles.avatarContainer} onClick={handleImageClick}>
        {jogador.fotoURL ? (
          <img src={jogador.fotoURL} alt="Avatar" className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {jogador.nome?.charAt(0).toUpperCase() || "?"}
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
        <button className={styles.btn} onClick={handleMudarSenha}>Mudar Senha</button>
      )}

      <div className={styles.section}>
        <h4>Contatos</h4>

        {modoEdicao ? (
          <>
            <label>
              WhatsApp:
              <input
                type="text"
                name="whatsapp"
                value={contatos.whatsapp}
                onChange={handleChangeContato}
              />
            </label>
            <label>
              Instagram:
              <input
                type="text"
                name="instagram"
                value={contatos.instagram}
                onChange={handleChangeContato}
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

      {/* HISTÓRICO DE AMISTOSOS AGORA: */}
      <div className={styles.section}>
        <h4>Histórico</h4>

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

      <div className={styles.section}>
  <h4>Central de Notificações</h4>
  {loadingConvites ? (
    <p>Carregando convites...</p>
  ) : convites.length === 0 ? (
    <p>Sem convites no momento.</p>
  ) : (
    <ul className={styles.convitesList}>
      {convites.map((convite) => (
        <li key={convite.id}>
          <strong>{convite.nomeClube}</strong> —{' '}
          <span
            style={{
              color:
                convite.status === 'aceito'
                  ? 'green'
                  : convite.status === 'recusado'
                  ? 'red'
                  : 'orange',
              fontWeight: 'bold',
            }}
          >
            {convite.status}
          </span>
          {convite.status === 'pendente' && (
            <div className={styles.acoesConvite}>
              <button
                onClick={() => handleAtualizarStatusConvite(convite.id, 'aceito', convite.nomeClube)}
                className={styles.btnAceitar}
              >
                Aceitar
              </button>
              <button
                onClick={() => handleAtualizarStatusConvite(convite.id, 'recusado')}
                className={styles.btnRecusar}
              >
                Recusar
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )}
</div>


      <div className={styles.section}>
        <h4>Chat</h4>
        <p>Abrir Chat entre jogadores</p>
      </div>

      <div className={styles.btnGroup}>
        {modoEdicao ? (
          <>
            <button className={styles.editBtn} onClick={handleSalvarContatos}>Salvar</button>
            <button className={styles.cancelBtn} onClick={handleCancelarEdicao}>Cancelar</button>
          </>
        ) : (
          <button className={styles.editBtn} onClick={handleEditar}>Editar</button>
        )}
      </div>
    </aside>
  );
}
