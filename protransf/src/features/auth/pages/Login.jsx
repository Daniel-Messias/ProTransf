import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Login.module.css";
import fundoLogin from "../../../assets/fotos/fundo-login.jpg";
import bola from "../../../assets/fotos/bola.png";

import { auth } from "../../../services/firebase"; // ajuste seu caminho conforme projeto
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [firebaseError, setFirebaseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

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
      await signInWithEmailAndPassword(auth, email, senha);

      setLoginSuccess(true);

      setTimeout(() => {
        setLoginSuccess(false);
        navigate("/"); // ou outra rota protegida
      }, 1500);
    } catch (error) {
      // Tratar erros comuns do Firebase
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

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnSecondary} disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </div>

              <div className={styles.linkCadastro}>
                Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
              </div>
            </form>
          </main>
        </div>

        {/* Modal de sucesso */}
        {loginSuccess && <div className={styles.modalSuccess}>Login realizado com sucesso!</div>}
      </div>
    </div>
  );
}
