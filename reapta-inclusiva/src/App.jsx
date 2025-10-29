import './App.css'

function App() {
  return (
    <>
      <div className="container">
        <h1>Reapta Inclusiva</h1>
        <h2>Login</h2>
        <form action="#" method="post">
          <div>
            <label htmlFor="email">Email:</label>
            <br/>
            <input type="email" name="email" id="email" placeholder="email@exemplo.com" required />
          </div>
          <div>
            <label htmlFor="senha">Senha:</label>
            <br />
            <input type="password" name="senha" id="senha" placeholder="Senha" required />
          </div>
          <br/>
          <a href="login.html">
            <button type="submit">Entrar</button>
          </a>
        </form>
      </div>
    </>
  )
}

export default App
