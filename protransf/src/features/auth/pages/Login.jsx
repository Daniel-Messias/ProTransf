import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Login.module.css";
import fundoLogin from "../../../assets/fotos/fundo-login.jpg";
import bola from "../../../assets/fotos/bola.png";

import { auth } from "../../../services/firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function Login() {
  // Estados para login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [firebaseError, setFirebaseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Estado para "Lembrar-me"
  const [lembrarMe, setLembrarMe] = useState(true);

  // Estados para recuperação de senha
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  // Validação simples de email
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Função para envio de login
  async function handleSubmit(e) {
    e.preventDefault();

    setErroEmail("");
    setErroSenha("");
    setFirebaseError("");

    let valido = true;

    if (!validarEmail(email.trim())) {
      setErroEmail("Digite um email válido.");
      valido = false;
    }

    if (senha.length < 6) {
      setErroSenha("A senha deve ter pelo menos 6 caracteres.");
      valido = false;
    }

    if (!valido) return;

    setLoading(true);

    try {
      // Define persistência conforme "Lembrar-me"
      await setPersistence(
        auth,
        lembrarMe ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, email, senha);

      setLoginSuccess(true);

      setTimeout(() => {
        setLoginSuccess(false);
        navigate("/"); // rota após login
      }, 1500);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setFirebaseError("Usuário não encontrado.");
      } else if (error.code === "auth/wrong-password") {
        setFirebaseError("Senha incorreta.");
      } else if (error.code === "auth/too-many-requests") {
        setFirebaseError("Muitas tentativas. Tente mais tarde.");
      } else {
        setFirebaseError("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Função para enviar email de recuperação de senha
  async function handleResetPassword() {
    setResetError("");
    setResetSuccess("");

    if (!validarEmail(resetEmail.trim())) {
      setResetError("Digite um email válido para recuperação.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setResetError("Usuário não encontrado para esse email.");
      } else {
        setResetError("Erro ao enviar email de recuperação. Tente novamente.");
      }
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div
      className={styles.loginContainer}
      style={{
        backgroundImage: `url(${fundoLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className={styles.overlay}>
        <Link to="/" className={styles.logoTop}>
          PR
          <img src={bola} alt="Bola" className={styles.logoBola} />
          <span>TRANSFER</span>
        </Link>

        <div className={styles.formWrapper}>
          <main className={styles.mainContent}>
            <h1 className={styles.title}>Bem-vindo de volta!</h1>
            <h2 className={styles.subtitle}>Faça login para continuar</h2>

            <form onSubmit={handleSubmit} noValidate className={styles.formulario}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`${styles.formInput} ${erroEmail || firebaseError ? styles.errorInput : ""}`}
                  disabled={loading}
                />
                {(erroEmail || firebaseError) && (
                  <span className={styles.errorMsg}>{erroEmail || firebaseError}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="senha">Senha:</label>
                <input
                  type="password"
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className={`${styles.formInput} ${erroSenha ? styles.errorInput : ""}`}
                  disabled={loading}
                />
                {erroSenha && <span className={styles.errorMsg}>{erroSenha}</span>}
              </div>

              {/* Checkbox lembrar-me */}
              <div className={styles.formGroupCheckbox}>
                <input
                  type="checkbox"
                  id="lembrarMe"
                  checked={lembrarMe}
                  onChange={() => setLembrarMe(!lembrarMe)}
                  disabled={loading}
                />
                <label htmlFor="lembrarMe">Lembrar-me</label>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnSecondary} disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </div>

              {/* Link Esqueci a senha */}
              <div className={styles.linkEsqueciSenha}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={loading}
                  className={styles.linkButton}
                >
                  Esqueci a senha
                </button>
              </div>

              <div className={styles.linkCadastro}>
                Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
              </div>
            </form>
          </main>
        </div>

        {/* Modal de sucesso do login */}
        {loginSuccess && <div className={styles.modalSuccess}>Login realizado com sucesso!</div>}

        {/* Modal recuperação de senha */}
        {showResetModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Recuperar Senha</h3>
              <input
                type="email"
                placeholder="Digite seu email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={resetLoading}
                className={resetError ? styles.errorInput : ""}
              />
              {resetError && <p className={styles.errorMsg}>{resetError}</p>}
              {resetSuccess && <p className={styles.successMsg}>{resetSuccess}</p>}
              <div className={styles.modalActions}>
                <button onClick={handleResetPassword} disabled={resetLoading}>
                  {resetLoading ? "Enviando..." : "Enviar Email"}
                </button>
                <button onClick={() => setShowResetModal(false)} disabled={resetLoading}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
