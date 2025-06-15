import React, { useState } from 'react';
import '../Clube.css';

export default function PerfilClubePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [procura, setProcura] = useState('sim');
  const [descricao, setDescricao] = useState("O The Horse FC é um clube focado em competições online, com uma equipe dedicada e apaixonada por jogos de futebol digital. Busca jogadores comprometidos e talentosos para reforçar seu elenco.");
  const [campeonatos, setCampeonatos] = useState([
    "Campeonato Nacional Virtual 2025",
    "Liga Digital de Futebol 2025",
    "Campeonato Paulista eSports 2025"
  ]);
  const [novoCampeonato, setNovoCampeonato] = useState('');
  const [jogadores, setJogadores] = useState([
    { nome: "ProGamer97", posicao: "Volante", status: "Contrato ativo", plataforma: "Xbox" },
    { nome: "SoccerKing11", posicao: "Atacante", status: "Contrato ativo", plataforma: "PlayStation" },
    { nome: "ElitePlayer22", posicao: "Goleiro", status: "Contrato ativo", plataforma: "PC" }
  ]);
  const [novoJogador, setNovoJogador] = useState({ nome: '', posicao: '', status: '', plataforma: '' });

  const handleProcuraChange = (e) => setProcura(e.target.value);

  const adicionarCampeonato = () => {
    if (novoCampeonato.trim() !== '') {
      setCampeonatos([...campeonatos, novoCampeonato.trim()]);
      setNovoCampeonato('');
    }
  };

  const removerCampeonato = (index) => {
    setCampeonatos(campeonatos.filter((_, i) => i !== index));
  };

  const adicionarJogador = () => {
    if (novoJogador.nome && novoJogador.posicao && novoJogador.status && novoJogador.plataforma) {
      setJogadores([...jogadores, novoJogador]);
      setNovoJogador({ nome: '', posicao: '', status: '', plataforma: '' });
    }
  };

  const removerJogador = (index) => {
    setJogadores(jogadores.filter((_, i) => i !== index));
  };

  const salvarAlteracoes = () => {
    setIsEditing(false);
    alert('Alterações salvas! (simulação)');
  };

  const cancelarEdicao = () => {
    setIsEditing(false);
  };

  return (
    <>
      <section className="clube-info">
        <h2>The Horse FC</h2>

        <div className="clube-detalhes">
          <p><strong>Fundação:</strong> 2020</p>
          <p><strong>Classificação:</strong> Top 1 no ranking</p>
          <div>
            <strong>Descrição:</strong><br />
            {isEditing ? (
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: 10, borderRadius: 6 }}
              />
            ) : (
              <p>{descricao}</p>
            )}
          </div>
        </div>

        <div className="info-campeonatos">
          <h3>Campeonatos que Participa</h3>
          <ul>
            {campeonatos.map((campeonato, index) => (
              <li key={index}>
                {campeonato}
                {isEditing && (
                  <button onClick={() => removerCampeonato(index)} className="btn-remover">🗑</button>
                )}
              </li>
            ))}
          </ul>
          {isEditing && (
            <div className="adicionar-campeonato">
              <input
                type="text"
                placeholder="Novo campeonato"
                value={novoCampeonato}
                onChange={(e) => setNovoCampeonato(e.target.value)}
                className="input-edit"
              />
              <button onClick={adicionarCampeonato} className="btn-login">Adicionar</button>
            </div>
          )}
        </div>

        <div className="info-procura-jogadores">
          <h3>Procurando Jogadores?</h3>
          <label htmlFor="procura-jogadores">
            <select
              id="procura-jogadores"
              value={procura}
              onChange={handleProcuraChange}
            >
              <option value="sim">Sim!</option>
              <option value="nao">Não.</option>
            </select>
          </label>
          <p id="msg-procura">
            {procura === 'sim'
              ? 'Sim, estamos em busca de novos talentos para nosso elenco!'
              : 'Não, o elenco está fechado no momento.'}
          </p>
        </div>

        <div className="jogadores-lista">
          <h3>Jogadores do Clube</h3>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Posição</th>
                <th>Status</th>
                <th>Plataforma</th>
                {isEditing && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {jogadores.map((jogador, index) => (
                <tr key={index}>
                  <td>{jogador.nome}</td>
                  <td>{jogador.posicao}</td>
                  <td>{jogador.status}</td>
                  <td>{jogador.plataforma}</td>
                  {isEditing && (
                    <td><button onClick={() => removerJogador(index)} className="btn-remover">❌</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {isEditing && (
            <div className="adicionar-campeonato">
              <input placeholder="Nome" value={novoJogador.nome} onChange={(e) => setNovoJogador({ ...novoJogador, nome: e.target.value })} className="input-edit" />
              <input placeholder="Posição" value={novoJogador.posicao} onChange={(e) => setNovoJogador({ ...novoJogador, posicao: e.target.value })} className="input-edit" />
              <input placeholder="Status" value={novoJogador.status} onChange={(e) => setNovoJogador({ ...novoJogador, status: e.target.value })} className="input-edit" />
              <input placeholder="Plataforma" value={novoJogador.plataforma} onChange={(e) => setNovoJogador({ ...novoJogador, plataforma: e.target.value })} className="input-edit" />
              <button onClick={adicionarJogador} className="btn-login">Adicionar Jogador</button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-login" style={{ marginTop: 20 }}>
            Editar Clube
          </button>
        ) : (
          <div style={{ marginTop: 20 }}>
            <button onClick={salvarAlteracoes} className="btn-login" style={{ marginRight: 10 }}>
              Salvar Alterações
            </button>
            <button onClick={cancelarEdicao} className="btn-cancelar">
              Cancelar
            </button>
          </div>
        )}
      </section>
    </>
  );
}
