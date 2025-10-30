import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <h1>Reapta Inclusiva</h1>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <br />
          <input type="email" name="email" id="email" placeholder="email@exemplo.com" required />
        </div>
        <div>
          <label htmlFor="senha">Senha:</label>
          <br />
          <input type="password" name="senha" id="senha" placeholder="Senha" required />
        </div>
        <br />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;