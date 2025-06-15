import React from "react";
import FormCadastro from '../components/FormCadastro';
import styles from '../cadastro.module.css';

function Cadastro() {
  return (
    <>
      
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>Crie sua conta</h1>
          <h2>Junte-se à comunidade ProTransf</h2>
          <FormCadastro />
        </section>
      </main>
    </>
  );
}

export default Cadastro;
