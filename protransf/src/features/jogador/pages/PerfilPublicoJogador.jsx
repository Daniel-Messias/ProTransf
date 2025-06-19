import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../Jogador.module.css';

export default function PerfilPublicoJogador() {
  const { id } = useParams();
  const [jogador, setJogador] = useState(null);
  const [dono, setDono] = useState(false);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const docRef = doc(db, 'usuarios', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setJogador(data);

          const user = auth.currentUser;
          if (user && user.uid === id) {
            setDono(true);
          }
        } else {
          console.log('Perfil não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    buscarDados();
  }, [id]);

  if (!jogador) return <p>Carregando perfil...</p>;

  return (
    <section className={styles.perfilJogador}>
      <div className={styles.perfilTopo}>
        <img
          src={jogador.fotoURL || "/default-avatar.jpg"}
          alt="Foto do Jogador"
          className={styles.fotoJogador}
        />

        <div className={styles.infoJogador}>
          <h1>
            {jogador.nome} <span className={styles.nickname}>@{jogador.username}</span>
          </h1>

          <p><strong>Posição Primária:</strong> {jogador.posicaoPrimaria}</p>
          <p><strong>Posição Secundária:</strong> {jogador.posicaoSecundaria || 'Nenhuma'}</p>
          <p><strong>Plataforma:</strong> {jogador.plataforma}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`${styles.status} ${jogador.status === 'Livre no mercado' ? styles.livre : styles.contratado}`}>
              {jogador.status || "Livre no mercado"}
            </span>
          </p>
        </div>
      </div>

      <div className={styles.descricaoJogador}>
        <h2>Sobre o Jogador</h2>
        <p>{jogador.bio || 'Sem descrição adicionada.'}</p>
      </div>

      <div className={styles.clubeAtual}>
        <h2>Clube Atual</h2>
        <p>{jogador.clubeAtual || 'Atualmente sem clube — disponível para propostas!'}</p>
      </div>

      <div className={styles.videosDestaque}>
        <h2>Melhores Jogadas</h2>
        {jogador.videos?.length ? (
          <div className={styles.videoGrid}>
            {jogador.videos.map((url, i) => (
              <div key={i} className={styles.videoWrapper}>
                <iframe
                  src={url}
                  title={`Video ${i + 1}`}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum vídeo enviado.</p>
        )}
      </div>

      {!dono && (
        <div className={styles.contatoJogador}>
          <h2>Contato</h2>
          <p>
            {jogador.whatsapp && (
              <a
                href={`https://wa.me/${jogador.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            )}{" "}
            {jogador.instagram && (
              <a
                href={`https://instagram.com/${jogador.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
