import React, { useState } from "react";
import styles from '../cadastro.module.css';

function FormCadastro() {
  const [form, setForm] = useState({
    nome: "",
    nickname: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    dataNascimento: "",
    plataforma: "",
    posicaoPrimaria: "",
    posicaoSecundaria: "",
    avatar: "",
    aceitaTermos: false,
  });

  const [errors, setErrors] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, avatar: reader.result }));
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (form.nome.trim().length < 2) newErrors.nome = "Digite seu nome completo.";
    if (form.nickname.trim().length < 2) newErrors.nickname = "Digite seu nome de usuário.";
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Digite um email válido.";
    if (form.senha.length < 6) newErrors.senha = "A senha deve ter pelo menos 6 caracteres.";
    if (form.senha !== form.confirmarSenha) newErrors.confirmarSenha = "As senhas não coincidem.";
    if (!form.dataNascimento) newErrors.dataNascimento = "Informe sua data de nascimento.";
    if (!form.plataforma) newErrors.plataforma = "Selecione uma plataforma.";
    if (!form.posicaoPrimaria) newErrors.posicaoPrimaria = "Escolha a posição primária.";
    if (!form.aceitaTermos) newErrors.aceitaTermos = "Você deve aceitar os termos de uso.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setModalAberto(true);
      setForm({
        nome: "",
        nickname: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        dataNascimento: "",
        plataforma: "",
        posicaoPrimaria: "",
        posicaoSecundaria: "",
        avatar: "",
        aceitaTermos: false,
      });
      setAvatarPreview("");
    }
  };

  return (
    <>
      <form className={styles.formulario} onSubmit={handleSubmit}>

        
        <div className={styles.formGroup}>
  <label>Foto/avatar:</label>
  <input type="file" accept="image/*" onChange={handleAvatarChange} className={styles.formInput} />
  {avatarPreview && (
    <div className="avatar-preview">
      <img src={avatarPreview} alt="Preview" />
    </div>
  )}
</div>
        <div className={styles.formGroup}>
          <label>Nome completo:</label>
          <input type="text" name="nome" value={form.nome} onChange={handleChange} className={styles.formInput} />
          {errors.nome && <span className={styles.errorMsg}>{errors.nome}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Nome de usuário (nickname):</label>
          <input type="text" name="nickname" value={form.nickname} onChange={handleChange} className={styles.formInput} />
          {errors.nickname && <span className={styles.errorMsg}>{errors.nickname}</span>}
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
          <input type="password" name="confirmarSenha" value={form.confirmarSenha} onChange={handleChange} className={styles.formInput} />
          {errors.confirmarSenha && <span className={styles.errorMsg}>{errors.confirmarSenha}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Data de nascimento:</label>
          <input type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} className={styles.formInput} />
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
          <label>Posição primária:</label>
          <select name="posicaoPrimaria" value={form.posicaoPrimaria} onChange={handleChange} className={styles.formInput}>
            <option value="">Selecione</option>
            <option value="goleiro">Goleiro</option>
            <option value="zagueiro">Zagueiro</option>
            <option value="lateral-direito">Lateral Direito</option>
            <option value="lateral-esquerdo">Lateral Esquerdo</option>
            <option value="volante">Volante</option>
            <option value="meio-campo">Meio-Campo</option>
            <option value="atacante">Atacante</option>
            <option value="ponta-direita">Ponta Direita</option>
            <option value="ponta-esquerda">Ponta Esquerda</option>
          </select>
          {errors.posicaoPrimaria && <span className={styles.errorMsg}>{errors.posicaoPrimaria}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Posição secundária (opcional):</label>
          <select name="posicaoSecundaria" value={form.posicaoSecundaria} onChange={handleChange} className={styles.formInput}>
            <option value="">Nenhuma</option>
            <option value="goleiro">Goleiro</option>
            <option value="zagueiro">Zagueiro</option>
            <option value="lateral-direito">Lateral Direito</option>
            <option value="lateral-esquerdo">Lateral Esquerdo</option>
            <option value="volante">Volante</option>
            <option value="meio-campo">Meio-Campo</option>
            <option value="atacante">Atacante</option>
            <option value="ponta-direita">Ponta Direita</option>
            <option value="ponta-esquerda">Ponta Esquerda</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxTermos}>
            <input
              type="checkbox"
              name="aceitaTermos"
              checked={form.aceitaTermos}
              onChange={handleChange}
            />
            Eu aceito os{" "}
            <button type="button" className={styles.linkButton}>termos de uso</button> e a{" "}
            <button type="button" className={styles.linkButton}>política de privacidade</button>.
          </label>
          {errors.aceitaTermos && <span className={styles.errorMsg}>{errors.aceitaTermos}</span>}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnSecondary}>Cadastrar</button>
        </div>
      </form>

      {modalAberto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Cadastro realizado com sucesso!</h3>
            <p>Seja bem-vindo(a) à ProTransf!</p>
            <button className={styles.btnSecondary} onClick={() => setModalAberto(false)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default FormCadastro;
