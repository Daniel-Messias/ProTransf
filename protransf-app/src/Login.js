import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './Firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      setMensagem("✅ Login realizado com sucesso!");
      setTimeout(() => {
        setMensagem('');
        navigate('/dashboard'); // altera para sua rota de painel
      }, 1500);
    } catch (erro) {
      setMensagem("❌ Erro ao fazer login: " + erro.message);
      setLoading(false);
      setTimeout(() => setMensagem(''), 4000);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        /><br /><br />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          disabled={loading}
        /><br /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p>{mensagem}</p>
    </div>
  );
}

export default Login;
