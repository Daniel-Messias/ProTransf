import React from "react";
import FormCadastro from '../components/FormCadastro';
import styles from '../cadastro.module.css';

function Cadastro() {
  return (
    <>
      
      <main className={styles.main}>
        <section className={styles.hero}>
          <FormCadastro />
        </section>
      </main>
    </>
  );
}

export default Cadastro;
