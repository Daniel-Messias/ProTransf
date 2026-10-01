import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';  // Importa o hook
import styles from "../cadastro.module.css";
import { auth, db, storage } from '../../../services/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { PLATAFORMAS, POSICOES, STATUS_LIVRE } from "../../../utils/jogador";

const posicoes = ["", ...POSICOES];

function Modal({ onClose }) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar modal"
        >
          &times;
        </button>
        <h3>Cadastro realizado com sucesso!</h3>
        <p>Seja bem-vindo à plataforma ProTransfer.</p>
        <button onClick={onClose} className={styles.btnSecondary}>
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function FormCadastro() {
  const navigate = useNavigate(); // hook para redirecionar

  const [formData, setFormData] = useState({
    nome: "",
    username: "",
    email: "",
    senha: "",
    senhaConfirm: "",
    nascimento: "",
    plataforma: "",
    posicaoPrimaria: "",
    posicaoSecundaria: "",
    termos: false,
    foto: null,
    tipoUsuario: "jogador",
  });

  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.username.trim()) newErrors.username = "Usuário é obrigatório";
    if (!formData.email.includes("@")) newErrors.email = "Email deve ser válido";
    if (formData.senha.length < 6)
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    if (formData.senha !== formData.senhaConfirm)
      newErrors.senhaConfirm = "As senhas não coincidem";
    if (!formData.senhaConfirm) newErrors.senhaConfirm = "Confirme sua senha";
    if (!formData.nascimento) newErrors.nascimento = "Data é obrigatória";
    if (!formData.plataforma) newErrors.plataforma = "Escolha uma plataforma";
    if (!formData.posicaoPrimaria)
      newErrors.posicaoPrimaria = "Selecione posição primária";
    if (!formData.termos) newErrors.termos = "Aceite os termos para continuar";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      if (files.length > 0) {
        setFormData((prev) => ({ ...prev, foto: files[0] }));
        setPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFirebaseError(null);
    if (!validate()) return;

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );
      const user = userCredential.user;

      let photoURL = null;
      if (formData.foto) {
        const imageRef = storageRef(storage, `avatars/${user.uid}/avatar.jpg`);
        await uploadBytes(imageRef, formData.foto);
        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(user, {
        displayName: formData.username,
        photoURL: photoURL,
      });

      await setDoc(doc(db, "usuarios", user.uid), {
        nome: formData.nome,
        username: formData.username,
        email: formData.email,
        nascimento: formData.nascimento,
        plataforma: formData.plataforma,
        posicaoPrimaria: formData.posicaoPrimaria,
        posicaoSecundaria: formData.posicaoSecundaria || "",
        termosAceitos: formData.termos,
        fotoUrl: photoURL || "",
        criadoEm: serverTimestamp(),
        tipo: formData.tipoUsuario,
        status: STATUS_LIVRE,
        clubeId: "",
      });

      setShowModal(true);
      setFormData({
        nome: "",
        username: "",
        email: "",
        senha: "",
        senhaConfirm: "",
        nascimento: "",
        plataforma: "",
        posicaoPrimaria: "",
        posicaoSecundaria: "",
        termos: false,
        foto: null,
        tipoUsuario: "jogador",
      });
      setPreview(null);
      setErrors({});
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      setFirebaseError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    // o AuthContext já acompanha o login ao vivo, não precisa recarregar a página
    navigate(auth.currentUser ? `/jogador/${auth.currentUser.uid}` : "/");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Crie sua conta</h2>
      <p className={styles.subtitulo}>
        Junte-se à comunidade <strong>ProTransfer</strong>
      </p>

      <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
        {firebaseError && (
          <div className={styles.errorMsg}>Erro: {firebaseError}</div>
        )}

        {/* Upload Foto */}
        <div className={styles.formGroup}>
          <label htmlFor="foto">Foto/avatar:</label>
          <input
            type="file"
            id="foto"
            name="foto"
            onChange={handleChange}
            className={styles.fileInput}
            accept="image/*"
          />
          <label htmlFor="foto" className={styles.fileInputLabel}>
            Escolher foto
          </label>
          {preview && (
            <div className={styles.avatarPreview}>
              <img src={preview} alt="Preview do avatar" />
            </div>
          )}
        </div>

        {/* Nome */}
        <div className={styles.formGroup}>
          <label htmlFor="nome">Nome completo:</label>
          <input
            id="nome"
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="Seu nome completo"
          />
          {errors.nome && <div className={styles.errorMsg}>{errors.nome}</div>}
        </div>

        {/* Username */}
        <div className={styles.formGroup}>
          <label htmlFor="username">Nome de usuário (nickname):</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="Seu nickname"
          />
          {errors.username && (
            <div className={styles.errorMsg}>{errors.username}</div>
          )}
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="exemplo@dominio.com"
          />
          {errors.email && <div className={styles.errorMsg}>{errors.email}</div>}
        </div>

        {/* Senha */}
        <div className={styles.formGroup}>
          <label htmlFor="senha">Senha:</label>
          <input
            id="senha"
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="********"
          />
          {errors.senha && <div className={styles.errorMsg}>{errors.senha}</div>}
        </div>

        {/* Repetir Senha */}
        <div className={styles.formGroup}>
          <label htmlFor="senhaConfirm">Repetir senha:</label>
          <input
            id="senhaConfirm"
            type="password"
            name="senhaConfirm"
            value={formData.senhaConfirm}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="********"
          />
          {errors.senhaConfirm && (
            <div className={styles.errorMsg}>{errors.senhaConfirm}</div>
          )}
        </div>

        {/* Nascimento */}
        <div className={styles.formGroup}>
          <label htmlFor="nascimento">Data de nascimento:</label>
          <input
            id="nascimento"
            type="date"
            name="nascimento"
            value={formData.nascimento}
            onChange={handleChange}
            className={styles.formInput}
          />
          {errors.nascimento && (
            <div className={styles.errorMsg}>{errors.nascimento}</div>
          )}
        </div>

        {/* Plataforma */}
        <div className={styles.formGroup}>
          <label htmlFor="plataforma">Plataforma:</label>
          <select
            id="plataforma"
            name="plataforma"
            value={formData.plataforma}
            onChange={handleChange}
            className={styles.formInput}
          >
            <option value="">Selecione</option>
            {PLATAFORMAS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {errors.plataforma && (
            <div className={styles.errorMsg}>{errors.plataforma}</div>
          )}
        </div>

        {/* Posição Primária */}
        <div className={styles.formGroup}>
          <label htmlFor="posicaoPrimaria">Posição Primária:</label>
          <select
            id="posicaoPrimaria"
            name="posicaoPrimaria"
            value={formData.posicaoPrimaria}
            onChange={handleChange}
            className={styles.formInput}
          >
            {posicoes.map((pos, i) => (
              <option key={i} value={pos}>
                {pos || "Selecione"}
              </option>
            ))}
          </select>
          {errors.posicaoPrimaria && (
            <div className={styles.errorMsg}>{errors.posicaoPrimaria}</div>
          )}
        </div>

        {/* Posição Secundária */}
        <div className={styles.formGroup}>
          <label htmlFor="posicaoSecundaria">Posição Secundária:</label>
          <select
            id="posicaoSecundaria"
            name="posicaoSecundaria"
            value={formData.posicaoSecundaria}
            onChange={handleChange}
            className={styles.formInput}
          >
            {posicoes.map((pos, i) => (
              <option key={i} value={pos}>
                {pos || "Nenhuma"}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo Usuário (novo) */}
        <div className={styles.formGroup}>
          <label htmlFor="tipoUsuario">Você está cadastrando como:</label>
          <select
            id="tipoUsuario"
            name="tipoUsuario"
            value={formData.tipoUsuario}
            onChange={handleChange}
            className={styles.formInput}
          >
            <option value="jogador">Jogador</option>
            <option value="clube_jogador">Clube + Jogador</option>
          </select>
        </div>

        {/* Termos */}
        <div className={styles.checkboxTermos}>
          <input
            type="checkbox"
            id="termos"
            name="termos"
            checked={formData.termos}
            onChange={handleChange}
          />
          <label htmlFor="termos">Eu aceito os termos de uso</label>
        </div>
        {errors.termos && <div className={styles.errorMsg}>{errors.termos}</div>}

        {/* Botão enviar */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.btnSecondary}
            disabled={!formData.termos || loading}
            aria-disabled={!formData.termos || loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>
      </form>

      {showModal && <Modal onClose={fecharModal} />}
    </div>
  );
}
