import React, { useState } from 'react';
import { auth } from './Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      setMensagem("✅ Usuário cadastrado com sucesso!");
      setEmail('');
      setSenha('');
    } catch (erro) {
      setMensagem("❌ Erro ao cadastrar: " + erro.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleCadastro}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Cadastrar</button>
      </form>
      <p>{mensagem}</p>
    </div>
  );
}

export default Cadastro;
