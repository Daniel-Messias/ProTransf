import React, { useState } from 'react';
import '../Clube.css';


export default function PerfilClubePage() {
  const [procura, setProcura] = useState('sim');

  const handleProcuraChange = (e) => {
    setProcura(e.target.value);
  };

  return (
    <>
      
      <section className="clube-info">
        <h2>The Horse FC</h2>
        <div className="clube-detalhes">
          <p><strong>Fundação:</strong> 2020</p>
          <p><strong>Classificação:</strong> Top 1 no ranking</p>
          <p><strong>Descrição:</strong> O The Horse FC é um clube focado em competições online, com uma equipe dedicada e apaixonada por jogos de futebol digital. Busca jogadores comprometidos e talentosos para reforçar seu elenco.</p>
        </div>

        <div className="info-campeonatos">
          <h3>Campeonatos que Participa</h3>
          <ul>
            <li>Campeonato Nacional Virtual 2025</li>
            <li>Liga Digital de Futebol 2025</li>
            <li>Campeonato Paulista eSports 2025</li>
          </ul>
        </div>

        <div className="info-procura-jogadores">
          <h3>Procurando Jogadores?</h3>
          <label htmlFor="procura-jogadores" style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--primary)', cursor: 'pointer' }}>
            <select
              id="procura-jogadores"
              style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--primary)', backgroundColor: 'var(--surface)', color: 'var(--text)', fontSize: '1rem' }}
              value={procura}
              onChange={handleProcuraChange}
            >
              <option value="sim">Sim!</option>
              <option value="nao">Não.</option>
            </select>
          </label>
          <p id="msg-procura" style={{ marginTop: 12, fontSize: '1.1rem', color: 'var(--text-muted)' }}>
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
              </tr>
            </thead>
            <tbody>
              <tr><td>ProGamer97</td><td>Volante</td><td>Contrato ativo</td><td>Xbox</td></tr>
              <tr><td>SoccerKing11</td><td>Atacante</td><td>Contrato ativo</td><td>PlayStation</td></tr>
              <tr><td>ElitePlayer22</td><td>Goleiro</td><td>Contrato ativo</td><td>PC</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        <a
          className="contato-link"
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp do dono do clube"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.52 3.48a11.8 11.8 0 00-16.68 0 11.77 11.77 0 00-3.49 8.34c0 2.08.6 4.1 1.75 5.82L2 22l4.46-1.7a11.72 11.72 0 005.84 1.71 11.8 11.8 0 008.32-3.48 11.77 11.77 0 000-16.68zm-8.52 15.56a9.35 9.35 0 01-4.95-1.4l-.35-.22-2.63 1 1-2.58-.23-.33a9.45 9.45 0 011.43-13.25 9.35 9.35 0 0113.21 1.42 9.36 9.36 0 01-8.23 14.96zm4.6-7.58c-.25-.13-1.46-.72-1.69-.8s-.39-.13-.56.13-.64.8-.78.96-.29.2-.54.07a7.5 7.5 0 01-2.2-1.36 8.35 8.35 0 01-1.55-1.93c-.16-.27 0-.42.12-.55.12-.12.27-.31.41-.47a1.9 1.9 0 00.28-.47c.09-.16.05-.3 0-.43s-.56-1.35-.77-1.85-.4-.42-.55-.42-.37-.01-.56-.01a1 1 0 00-.74.35 3.11 3.11 0 00-1 2.35 4.22 4.22 0 001.21 2.92 9.4 9.4 0 005.3 4.37 3.74 3.74 0 001.55.24 2.74 2.74 0 001.92-1.44c.19-.33.26-.6.19-.66z"/></svg>
          WhatsApp
        </a>
        <a
          className="contato-link"
          href="https://instagram.com/clubefcvirtual"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram do clube"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.76 5.76 0 0122 7.75v8.5A5.76 5.76 0 0116.25 22h-8.5A5.76 5.76 0 012 16.25v-8.5A5.76 5.76 0 017.75 2zm7.55 2.22h-7.6a3.5 3.5 0 00-3.5 3.5v7.6a3.5 3.5 0 003.5 3.5h7.6a3.5 3.5 0 003.5-3.5v-7.6a3.5 3.5 0 00-3.5-3.5zm-3.8 2.98a4.25 4.25 0 110 8.5 4.25 4.25 0 010-8.5zm0 6.83a2.58 2.58 0 100-5.16 2.58 2.58 0 000 5.16zm3.7-6.98a1 1 0 110-2 1 1 0 010 2z"/></svg>
          Instagram
        </a>
      </footer>
    </>
  );
}
