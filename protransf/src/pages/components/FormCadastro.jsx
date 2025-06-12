import React, { useState } from "react";
import styles from '../cadastro.module.css';


function FormCadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    dataNascimento: "",
    plataforma: "",
    posicoes: [],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => {
        const newPosicoes = checked
          ? [...prev.posicoes, value]
          : prev.posicoes.filter((p) => p !== value);
        return { ...prev, posicoes: newPosicoes };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (form.nome.trim().length < 2) newErrors.nome = "Digite seu nome completo.";
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Digite um email válido.";
    if (form.senha.length < 6) newErrors.senha = "A senha deve ter pelo menos 6 caracteres.";
    if (form.senha !== form.confirmarSenha) newErrors.confirmarSenha = "As senhas não coincidem.";
    if (!form.dataNascimento) newErrors.dataNascimento = "Informe sua data de nascimento.";
    if (!form.plataforma) newErrors.plataforma = "Selecione uma plataforma.";
    if (form.posicoes.length === 0) newErrors.posicoes = "Selecione ao menos uma posição.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert("Cadastro realizado com sucesso!");
      setForm({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        dataNascimento: "",
        plataforma: "",
        posicoes: [],
      });
    }
  };

  return (
    <form className={styles.formulario} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label>Nome completo:</label>
        <input type="text" name="nome" value={form.nome} onChange={handleChange} className={styles.formInput} />
        {errors.nome && <span className={styles.errorMsg}>{errors.nome}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Email:</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} className={styles.formInput} />
        {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Senha:</label>
        <input type="password" name="senha" value={form.senha} onChange={handleChange} className={styles.formInput} />
        {errors.senha && <span className={styles.errorMsg}>{errors.senha}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Repita a senha:</label>
        <input
          type="password"
          name="confirmarSenha"
          value={form.confirmarSenha}
          onChange={handleChange}
          className={styles.formInput}
        />
        {errors.confirmarSenha && <span className={styles.errorMsg}>{errors.confirmarSenha}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Data de nascimento:</label>
        <input
          type="date"
          name="dataNascimento"
          value={form.dataNascimento}
          onChange={handleChange}
          className={styles.formInput}
        />
        {errors.dataNascimento && <span className={styles.errorMsg}>{errors.dataNascimento}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Plataforma:</label>
        <select name="plataforma" value={form.plataforma} onChange={handleChange} className={styles.formInput}>
          <option value="">Selecione</option>
          <option value="pc">PC</option>
          <option value="xbox">Xbox</option>
          <option value="playstation">PlayStation</option>
        </select>
        {errors.plataforma && <span className={styles.errorMsg}>{errors.plataforma}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Posições que você joga:</label>
        <div className={styles.checkboxGroup}>
          {["goleiro", "zagueiro", "lateral", "meio-campo", "atacante"].map((pos) => (
            <label key={pos}>
              <input
                type="checkbox"
                name="posicoes"
                value={pos}
                checked={form.posicoes.includes(pos)}
                onChange={handleChange}
              />
              <span>{pos.charAt(0).toUpperCase() + pos.slice(1)}</span>
            </label>
          ))}
        </div>
        {errors.posicoes && <span className={styles.errorMsg}>{errors.posicoes}</span>}
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnSecondary}>Cadastrar</button>
      </div>
    </form>
  );
}

export default FormCadastro;
