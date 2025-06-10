import React from 'react';
import Cadastro from './Cadastro';
import Login from './Login';

function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
      <Cadastro />
      <Login />
    </div>
  );
}

export default App;
