import './cadastro.css'

function App() {
  return (
    <>
      <div className="container">
        <h1>Reapta Inclusiva</h1>
        <h2>Cadastro de Usuário</h2>

        <form action="#" method="post">
          <div>
            <label htmlFor="nome">Nome Completo:</label>
            <br />
            <input
              type="text"
              name="nome"
              id="nome"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label htmlFor="email">E-mail:</label>
            <br />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="campo-duplo">
            <div>
              <label htmlFor="senha">Criar Senha:</label>
              <br />
              <input
                type="password"
                name="senha"
                id="senha"
                placeholder="Mínimo 6 caracteres"
                required
                minLength="6"
              />
            </div>

            <div>
              <label htmlFor="confirmar_senha">Confirmar Senha:</label>
              <br />
              <input
                type="password"
                name="confirmar_senha"
                id="confirmar_senha"
                placeholder="Repita a senha"
                required
                minLength="6"
              />
            </div>
          </div>

          <br />
          <button type="submit">Cadastrar</button>
        </form>
      </div>
    </>
  )
}

export default App
