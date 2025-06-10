// src/Cadastro.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './Firebase';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      setMensagem('✅ Cadastro realizado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
    } catch (erro) {
      setMensagem('❌ Erro ao cadastrar: ' + erro.message);
    }
  };

  return (
    <div style={estilos.container}>
      <h2 style={estilos.titulo}>Cadastro</h2>
      <form onSubmit={handleCadastro} style={estilos.formulario}>
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={estilos.input}
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={estilos.input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={estilos.input}
        />
        <button type="submit" style={estilos.botao}>Cadastrar</button>
      </form>
      <p style={estilos.mensagem}>{mensagem}</p>
    </div>
  );
}

const estilos = {
  container: {
    maxWidth: '400px',
    margin: 'auto',
    marginTop: '50px',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
  },
  titulo: {
    textAlign: 'center',
    marginBottom: '20px',
    fontFamily: 'Arial',
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  botao: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  mensagem: {
    marginTop: '15px',
    textAlign: 'center',
    fontWeight: 'bold',
  }
};

export default Cadastro;
