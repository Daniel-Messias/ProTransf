import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import styles from './Login.module.css';
import fundoLogin from '../assets/fotos/fundo-login.jpg';
import bola from '../assets/fotos/bola.png'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false); // novo estado modal
  const navigate = useNavigate();

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function handleSubmit(e) {
    e.preventDefault();

    let valido = true;

    if (!validarEmail(email.trim())) {
      setErroEmail('Digite um email válido.');
      valido = false;
    } else {
      setErroEmail('');
    }

    if (senha.length < 6) {
      setErroSenha('A senha deve ter pelo menos 6 caracteres.');
      valido = false;
    } else {
      setErroSenha('');
    }

    if (valido) {
      
      setLoginSuccess(true);

      
      setTimeout(() => {
        setLoginSuccess(false);
        navigate('/');
      }, 2000);
    }
  }

  return (
    <div
      className={styles.loginContainer}
      style={{
        backgroundImage: `url(${fundoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className={styles.overlay}>
        <Link to="/" className={styles.logoTop}>
          PR<img src={bola} alt="Bola" className={styles.logoBola}/><span>TRANSFER</span>
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
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`${styles.formInput} ${erroEmail ? styles.errorInput : ''}`}
                />
                {erroEmail && <span className={styles.errorMsg}>{erroEmail}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="senha">Senha:</label>
                <input
                  type="password"
                  id="senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  className={`${styles.formInput} ${erroSenha ? styles.errorInput : ''}`}
                />
                {erroSenha && <span className={styles.errorMsg}>{erroSenha}</span>}
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnSecondary}>Entrar</button>
              </div>

              <div className={styles.linkCadastro}>
                Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
              </div>
            </form>
          </main>
        </div>

        {/* Modal de sucesso */}
        {loginSuccess && (
          <div className={styles.modalSuccess}>
            Login realizado com sucesso!
          </div>
        )}
      </div>
    </div>
  );
}
